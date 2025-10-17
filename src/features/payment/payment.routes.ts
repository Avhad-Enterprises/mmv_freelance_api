import { Router } from "express";
import Route from "../../interfaces/route.interface";
import PaymentController from "./payment.controller";

export default class PaymentRoute implements Route {
    public path = "/payment";
    public router = Router();
    private controller = new PaymentController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Create a new payment order
        this.router.post(
            `${this.path}/create`,
            this.controller.createOrder.bind(this.controller)
        );
        // Verify payment
        this.router.get(
            `${this.path}/history`,
            this.controller.getAllTransactions.bind(this.controller)
        );
        // Get user payment history
        this.router.get(
            `${this.path}/user-history`,
            this.controller.getUserTransactions.bind(this.controller)
        );
        // Get project-specific payment history
        this.router.get(
            `${this.path}/project/:id`,
            this.controller.getProjectTransactions.bind(this.controller)
        );
    }
}
