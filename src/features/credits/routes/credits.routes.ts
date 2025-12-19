/**
 * Credits Routes
 * Freelancer credits management endpoints
 */

import { Router } from 'express';
import { CreditsController } from '../controllers';
import { requireRole } from '../../../middlewares/role.middleware';
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
        const freelancerAuth = requireRole('VIDEOGRAPHER', 'VIDEO_EDITOR');

        // GET /api/v1/credits/balance
        this.router.get(
            `${this.path}/balance`,
            freelancerAuth,
            creditOperationsLimiter,
            this.creditsController.getCreditsBalance
        );

        // GET /api/v1/credits/packages
        this.router.get(
            `${this.path}/packages`,
            freelancerAuth,
            creditOperationsLimiter,
            this.creditsController.getPackages
        );

        // POST /api/v1/credits/initiate-purchase
        this.router.post(
            `${this.path}/initiate-purchase`,
            freelancerAuth,
            purchaseLimiter,
            validationMiddleware(InitiatePurchaseDto, 'body', false, undefined),
            this.creditsController.initiatePurchase
        );

        // POST /api/v1/credits/verify-payment
        this.router.post(
            `${this.path}/verify-payment`,
            freelancerAuth,
            creditOperationsLimiter,
            validationMiddleware(VerifyPaymentDto, 'body', false, undefined),
            this.creditsController.verifyPayment
        );

        // POST /api/v1/credits/purchase (legacy)
        this.router.post(
            `${this.path}/purchase`,
            freelancerAuth,
            purchaseLimiter,
            validationMiddleware(PurchaseCreditsDto, 'body', false, undefined),
            this.creditsController.purchaseCredits
        );

        // GET /api/v1/credits/history
        this.router.get(
            `${this.path}/history`,
            freelancerAuth,
            creditOperationsLimiter,
            this.creditsController.getHistory
        );

        // GET /api/v1/credits/refund-eligibility/:application_id
        this.router.get(
            `${this.path}/refund-eligibility/:application_id`,
            freelancerAuth,
            creditOperationsLimiter,
            this.creditsController.checkRefundEligibility
        );

        // GET /api/v1/credits/refunds
        this.router.get(
            `${this.path}/refunds`,
            freelancerAuth,
            creditOperationsLimiter,
            this.creditsController.getRefunds
        );
    }
}

export default CreditsRoutes;
