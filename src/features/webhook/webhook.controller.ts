/**
 * Razorpay Webhook Controller
 * Handles payment webhooks with idempotency for credit purchases
 * 
 * SECURITY FEATURES:
 * - Signature verification using HMAC-SHA256
 * - Idempotency check to prevent duplicate processing
 * - Automatic credit addition on successful payment
 */

import { Request, Response } from "express";
import crypto from "crypto";
import PaymentService from "../payment/payment.service";
import { CreditsService, CreditLoggerService } from "../credits/services";
import { razorpay } from "../../utils/payment/razor.util";
import DB, { T } from "../../../database/index";

export default class RazorpayWebhookController {
    private paymentService = new PaymentService();
    private creditsService = new CreditsService();
    private creditLogger = new CreditLoggerService();

    /**
     * POST /webhook/razorpay - Handle Razorpay webhooks
     * Processes payment.captured and payment.failed events
     */
    public handleWebhook = async (req: Request, res: Response) => {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!secret) {
            console.error("RAZORPAY_WEBHOOK_SECRET not configured");
            return res.status(500).json({ message: "Webhook secret not configured" });
        }

        const razorSignature = req.headers["x-razorpay-signature"] as string;

        if (!razorSignature) {
            console.warn("Missing webhook signature");
            return res.status(400).json({ message: "Missing signature" });
        }

        const body = JSON.stringify(req.body);
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(body)
            .digest("hex");

        // Verify signature
        if (expectedSignature !== razorSignature) {
            console.warn("Invalid webhook signature");
            return res.status(400).json({ message: "Invalid signature" });
        }

        const event = req.body.event;
        console.log(`Webhook received: ${event}`);

        try {
            if (event === "payment.captured") {
                await this.handlePaymentCaptured(req.body.payload.payment.entity);
            }

            if (event === "payment.failed") {
                await this.handlePaymentFailed(req.body.payload.payment.entity);
            }

            return res.status(200).json({
                status: "success",
                message: "Webhook handled successfully"
            });
        } catch (error) {
            console.error("Webhook handling error:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };

    /**
     * Handle successful payment
     * Adds credits for credit purchases, updates transaction status for escrow
     */
    private async handlePaymentCaptured(payment: any): Promise<void> {
        const razorpayOrderId = payment.order_id;
        const razorpayPaymentId = payment.id;
        const amountInPaise = payment.amount;
        const amountInRupees = amountInPaise / 100;

        console.log(`Processing payment.captured - Order: ${razorpayOrderId}, Payment: ${razorpayPaymentId}`);

        // IDEMPOTENCY CHECK: Has this payment already been processed?
        const alreadyProcessed = await this.creditLogger.isPaymentProcessed(razorpayPaymentId);
        if (alreadyProcessed) {
            console.log(`Payment ${razorpayPaymentId} already processed, skipping`);
            return;
        }

        try {
            // Fetch order details from Razorpay to get notes
            const order = await razorpay.orders.fetch(razorpayOrderId);
            const notes = order.notes as Record<string, string>;

            // Check if this is a credit purchase
            if (notes && notes.type === 'credit_purchase') {
                await this.processCreditPurchase(
                    Number(notes.user_id),
                    Number(notes.credits),
                    razorpayOrderId,
                    razorpayPaymentId,
                    amountInRupees,
                    notes.package_id ? Number(notes.package_id) : undefined
                );
            } else {
                // Handle regular escrow payment
                await this.paymentService.updateOrderStatus(
                    razorpayOrderId,
                    "completed",
                    razorpayPaymentId
                );
                console.log(`Escrow payment captured: ${razorpayOrderId}`);
            }
        } catch (error) {
            console.error(`Error processing payment ${razorpayPaymentId}:`, error);
            throw error;
        }
    }

    /**
     * Process credit purchase after payment verification
     * Adds credits to user's balance with full audit trail
     */
    private async processCreditPurchase(
        userId: number,
        credits: number,
        orderId: string,
        paymentId: string,
        amount: number,
        packageId?: number
    ): Promise<void> {
        console.log(`Adding ${credits} credits to user ${userId} for payment ${paymentId}`);

        // Use transaction to ensure atomicity
        await DB.transaction(async (trx) => {
            // Get current balance with row lock
            const profile = await trx(T.FREELANCER_PROFILES)
                .where({ user_id: userId })
                .select('credits_balance', 'total_credits_purchased')
                .forUpdate()
                .first();

            if (!profile) {
                throw new Error(`Freelancer profile not found for user ${userId}`);
            }

            const newBalance = profile.credits_balance + credits;
            const newTotalPurchased = profile.total_credits_purchased + credits;

            // Update balance
            await trx(T.FREELANCER_PROFILES)
                .where({ user_id: userId })
                .update({
                    credits_balance: newBalance,
                    total_credits_purchased: newTotalPurchased,
                    updated_at: trx.fn.now()
                });

            // Log the transaction (this also serves as idempotency record)
            await this.creditLogger.log({
                user_id: userId,
                transaction_type: 'purchase',
                amount: credits,
                balance_before: profile.credits_balance,
                balance_after: newBalance,
                reference_type: 'payment',
                payment_gateway: 'razorpay',
                payment_order_id: orderId,
                payment_transaction_id: paymentId, // Unique - prevents duplicates
                payment_amount: amount,
                payment_currency: 'INR',
                package_id: packageId,
                description: `Purchased ${credits} credits via Razorpay`
            }, trx);
        });

        console.log(`Successfully added ${credits} credits to user ${userId}`);
    }

    /**
     * Handle failed payment
     * Updates transaction status to failed
     */
    private async handlePaymentFailed(payment: any): Promise<void> {
        const razorpayOrderId = payment.order_id;
        const razorpayPaymentId = payment.id;
        const errorCode = payment.error_code;
        const errorDescription = payment.error_description;

        console.log(`Payment failed - Order: ${razorpayOrderId}, Error: ${errorCode} - ${errorDescription}`);

        try {
            // Check if it's a credit purchase or escrow
            const order = await razorpay.orders.fetch(razorpayOrderId);
            const notes = order.notes as Record<string, string>;

            if (notes && notes.type === 'credit_purchase') {
                // Log failed credit purchase attempt (for analytics)
                console.log(`Credit purchase failed for user ${notes.user_id}: ${errorDescription}`);
            } else {
                // Update escrow transaction status
                await this.paymentService.updateOrderStatus(
                    razorpayOrderId,
                    "failed",
                    razorpayPaymentId
                );
            }
        } catch (error) {
            console.error(`Error handling failed payment ${razorpayPaymentId}:`, error);
            // Don't throw - failed payments don't need to block webhook
        }
    }
}
