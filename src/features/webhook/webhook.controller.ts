import { Request, Response } from "express";
import crypto from "crypto";
import PaymentService from "../payment/payment.service";

export default class RazorpayWebhookController {
    private service = new PaymentService();

    // POST /webhook/razorpay - Handle Razorpay webhooks
    public handleWebhook = async (req: Request, res: Response) => {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
        const razorSignature = req.headers["x-razorpay-signature"] as string;

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

        try {
            // Handle successful payment
            if (event === "payment.captured") {
                const payment = req.body.payload.payment.entity;
                const razorpayOrderId = payment.order_id;
                const razorpayPaymentId = payment.id;

                await this.service.updateOrderStatus(
                    razorpayOrderId,
                    "completed",
                    razorpayPaymentId
                );
                console.log("Payment captured:", razorpayOrderId);
            }

            if (event === "payment.failed") {
                const payment = req.body.payload.payment.entity;
                const razorpayOrderId = payment.order_id;
                const razorpayPaymentId = payment.id;
                await this.service.updateOrderStatus(
                    razorpayOrderId,
                    "failed",
                    razorpayPaymentId
                );
            }

            return res
                .status(200)
                .json({ status: "Webhook handled successfully" });
        } catch (error) {
            console.error(" Webhook handling error:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
}
