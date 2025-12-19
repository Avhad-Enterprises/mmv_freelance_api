/**
 * Credits Routes
 * Freelancer credits management endpoints
 * 
 * Uses Dynamic RBAC with permission-based access control
 */

import { Router } from 'express';
import { CreditsController } from '../controllers';
import { requirePermission } from '../../../middlewares/permission.middleware';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { InitiatePurchaseDto, PurchaseCreditsDto, VerifyPaymentDto } from '../dto';
import Route from '../../../interfaces/route.interface';
import { creditOperationsLimiter, purchaseLimiter } from '../middlewares';

export class CreditsRoutes implements Route {
    public path = '/credits';
    public router = Router();
    private creditsController = new CreditsController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // GET /api/v1/credits/balance
        // Permission: credits.view_own - View own credit balance
        this.router.get(
            `${this.path}/balance`,
            requirePermission('credits.view_own'),
            creditOperationsLimiter,
            this.creditsController.getCreditsBalance
        );

        // GET /api/v1/credits/packages
        // Permission: credits.view_packages - View available credit packages
        this.router.get(
            `${this.path}/packages`,
            requirePermission('credits.view_packages'),
            creditOperationsLimiter,
            this.creditsController.getPackages
        );

        // POST /api/v1/credits/initiate-purchase
        // Permission: credits.purchase - Purchase credits
        this.router.post(
            `${this.path}/initiate-purchase`,
            requirePermission('credits.purchase'),
            purchaseLimiter,
            validationMiddleware(InitiatePurchaseDto, 'body', false, undefined),
            this.creditsController.initiatePurchase
        );

        // POST /api/v1/credits/verify-payment
        // Permission: credits.purchase - Verify and complete payment
        this.router.post(
            `${this.path}/verify-payment`,
            requirePermission('credits.purchase'),
            creditOperationsLimiter,
            validationMiddleware(VerifyPaymentDto, 'body', false, undefined),
            this.creditsController.verifyPayment
        );

        // POST /api/v1/credits/purchase (legacy)
        // Permission: credits.purchase - Purchase credits (legacy endpoint)
        this.router.post(
            `${this.path}/purchase`,
            requirePermission('credits.purchase'),
            purchaseLimiter,
            validationMiddleware(PurchaseCreditsDto, 'body', false, undefined),
            this.creditsController.purchaseCredits
        );

        // GET /api/v1/credits/history
        // Permission: credits.view_history - View transaction history
        this.router.get(
            `${this.path}/history`,
            requirePermission('credits.view_history'),
            creditOperationsLimiter,
            this.creditsController.getHistory
        );

        // GET /api/v1/credits/refund-eligibility/:application_id
        // Permission: credits.request_refund - Check refund eligibility
        this.router.get(
            `${this.path}/refund-eligibility/:application_id`,
            requirePermission('credits.request_refund'),
            creditOperationsLimiter,
            this.creditsController.checkRefundEligibility
        );

        // GET /api/v1/credits/refunds
        // Permission: credits.request_refund - View own refunds
        this.router.get(
            `${this.path}/refunds`,
            requirePermission('credits.request_refund'),
            creditOperationsLimiter,
            this.creditsController.getRefunds
        );
    }
}

export default CreditsRoutes;
