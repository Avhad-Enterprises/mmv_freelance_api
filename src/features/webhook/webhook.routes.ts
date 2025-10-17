import express from "express";
import { Router } from "express";
import Route from "../../interfaces/route.interface";
import RazorpayWebhookController from "./webhook.controller";

export default class WebhookRoute implements Route {
    public path = "/webhook";
    public router = Router();
    private controller = new RazorpayWebhookController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Razorpay webhook endpoint
        this.router.post(
            `${this.path}/razorpay`,
            express.json({
                verify: (req, res, buf) => {
                    (req as any).rawBody = buf;
                },
            }), // Required for signature verification
            this.controller.handleWebhook.bind(this.controller)
        );
    }
}
