/**
 * Credits Controller
 * Handles freelancer credits management endpoints
 */

import { Response, NextFunction } from 'express';
import { CreditsService } from '../services';
import { RequestWithUser } from '../../../interfaces/auth.interface';
import HttpException from '../../../exceptions/HttpException';
import { CREDIT_CONFIG, CREDIT_PACKAGES } from '../constants';
import { razorpay } from '../../../utils/payment/razor.util';

export class CreditsController {
    private creditsService = new CreditsService();

    /**
     * Get freelancer credits balance
     * GET /api/v1/credits/balance
     */
    public getCreditsBalance = async (
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const user_id = req.user.user_id;
            const credits = await this.creditsService.getCreditsBalance(user_id);

            res.status(200).json({
                success: true,
                data: {
                    ...credits,
                    pricePerCredit: CREDIT_CONFIG.PRICE_PER_CREDIT,
                    currency: CREDIT_CONFIG.CURRENCY
                },
                message: "Credits balance retrieved successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get available credit packages
     * GET /api/v1/credits/packages
     */
    public getPackages = async (
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const packagesData = this.creditsService.getPackages();

            res.status(200).json({
                success: true,
                data: packagesData,
                message: "Credit packages retrieved successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Initiate credit purchase - creates Razorpay order
     * POST /api/v1/credits/initiate-purchase
     */
    public initiatePurchase = async (
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const user_id = req.user.user_id;
            const { credits_amount, package_id } = req.body;

            let credits: number;
            let amount: number;
            let packageName: string | undefined;

            if (package_id) {
                const pkg = CREDIT_PACKAGES.find(p => p.id === package_id);
                if (!pkg) {
                    throw new HttpException(400, "Invalid package ID");
                }
                credits = pkg.credits;
                amount = pkg.price * 100; // Razorpay uses paise
                packageName = pkg.name;
            } else {
                credits = credits_amount;
                amount = credits * CREDIT_CONFIG.PRICE_PER_CREDIT * 100;
            }

            // Validate purchase
            const canPurchase = await this.creditsService.canPurchase(user_id, credits);
            if (!canPurchase.canPurchase) {
                throw new HttpException(400, canPurchase.reason!);
            }

            // Create Razorpay order
            const order = await razorpay.orders.create({
                amount: amount,
                currency: CREDIT_CONFIG.CURRENCY,
                receipt: `credits_${user_id}_${Date.now()}`,
                notes: {
                    user_id: user_id.toString(),
                    credits: credits.toString(),
                    package_id: package_id?.toString() || '',
                    type: 'credit_purchase'
                }
            });

            res.status(200).json({
                success: true,
                data: {
                    order_id: order.id,
                    amount: order.amount,
                    currency: CREDIT_CONFIG.CURRENCY,
                    credits: credits,
                    package_name: packageName,
                    key_id: process.env.RAZORPAY_KEY_ID,
                    user: {
                        name: `${req.user.first_name} ${req.user.last_name}`,
                        email: req.user.email
                    }
                },
                message: "Order created successfully. Complete payment to receive credits."
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Verify Razorpay payment signature (frontend callback)
     * POST /api/v1/credits/verify-payment
     */
    public verifyPayment = async (
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const user_id = req.user.user_id;
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

            const crypto = require('crypto');
            const secret = process.env.RAZORPAY_KEY_SECRET;

            if (!secret) {
                throw new HttpException(500, 'Payment verification not configured');
            }

            const body = razorpay_order_id + '|' + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(body)
                .digest('hex');

            if (expectedSignature !== razorpay_signature) {
                throw new HttpException(400, 'Invalid payment signature');
            }

            const payment = await razorpay.payments.fetch(razorpay_payment_id);

            if (payment.status !== 'captured') {
                throw new HttpException(400, `Payment not captured. Status: ${payment.status}`);
            }

            const order = await razorpay.orders.fetch(razorpay_order_id);
            const notes = order.notes as Record<string, string>;

            if (notes.user_id !== user_id.toString()) {
                throw new HttpException(403, 'Payment does not belong to this user');
            }

            const balance = await this.creditsService.getCreditsBalance(user_id);

            res.status(200).json({
                success: true,
                data: {
                    payment_verified: true,
                    payment_id: razorpay_payment_id,
                    credits_purchased: Number(notes.credits),
                    current_balance: balance.credits_balance,
                    total_purchased: balance.total_credits_purchased
                },
                message: `Payment verified. ${notes.credits} credits added to your account.`
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Purchase credits (legacy)
     * @deprecated Use initiate-purchase + webhook flow instead
     */
    public purchaseCredits = async (
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const user_id = req.user.user_id;
            const { credits_amount, payment_reference } = req.body;

            if (!payment_reference) {
                throw new HttpException(400, "Payment reference is required");
            }

            if (!credits_amount || credits_amount <= 0) {
                throw new HttpException(400, "Valid credits_amount is required");
            }

            if (credits_amount > CREDIT_CONFIG.MAX_SINGLE_PURCHASE) {
                throw new HttpException(400, `Maximum ${CREDIT_CONFIG.MAX_SINGLE_PURCHASE} credits per purchase`);
            }

            const result = await this.creditsService.addCredits(
                user_id,
                credits_amount,
                payment_reference
            );

            res.status(200).json({
                success: true,
                data: result,
                message: `${credits_amount} credits added successfully`
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get credit transaction history
     * GET /api/v1/credits/history
     */
    public getHistory = async (
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const user_id = req.user.user_id;
            const { limit = 20, offset = 0, type, page = 1 } = req.query;

            const actualOffset = offset ? Number(offset) : (Number(page) - 1) * Number(limit);

            const effectiveLimit = Math.min(Number(limit), 50);

            const [history, totalCount] = await Promise.all([
                this.creditsService.getHistory(user_id, {
                    limit: effectiveLimit,
                    offset: actualOffset,
                    type: type as string
                }),
                this.creditsService.getHistoryCount(user_id, { type: type as string })
            ]);

            res.status(200).json({
                success: true,
                data: {
                    transactions: history,
                    pagination: {
                        total: totalCount,
                        page: Number(page),
                        limit: effectiveLimit,
                        totalPages: Math.ceil(totalCount / Number(limit))
                    }
                },
                message: "Credit history retrieved successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Check refund eligibility for an application
     * GET /api/v1/credits/refund-eligibility/:application_id
     */
    public checkRefundEligibility = async (
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const user_id = req.user.user_id;
            const { application_id } = req.params;

            const { CreditRefundService, RefundReason } = await import('../services/credit-refund.service');
            const refundService = new CreditRefundService();

            const eligibility = await refundService.checkRefundEligibility(
                parseInt(application_id),
                user_id,
                RefundReason.WITHDRAWAL
            );

            res.status(200).json({
                success: true,
                data: {
                    application_id: parseInt(application_id),
                    eligible: eligibility.eligible,
                    refund_amount: eligibility.refundAmount,
                    refund_percent: eligibility.refundPercent,
                    original_credits: eligibility.originalCredits,
                    reason: eligibility.reason
                },
                message: eligibility.eligible
                    ? `Eligible for ${eligibility.refundPercent}% refund`
                    : eligibility.reason
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get user's refund history
     * GET /api/v1/credits/refunds
     */
    public getRefunds = async (
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const user_id = req.user.user_id;

            const { CreditRefundService } = await import('../services/credit-refund.service');
            const refundService = new CreditRefundService();

            const refunds = await refundService.getUserRefunds(user_id);

            res.status(200).json({
                success: true,
                data: refunds,
                message: "Refund history retrieved successfully"
            });
        } catch (error) {
            next(error);
        }
    };
}

export default CreditsController;
