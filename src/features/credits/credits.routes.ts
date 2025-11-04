import { Router } from 'express';
import { CreditsController } from './credits.controller';
import { requireRole } from '../../middlewares/role.middleware';
import validationMiddleware from '../../middlewares/validation.middleware';
import { PurchaseCreditsDto } from './credits.dto';
import Route from '../../interfaces/route.interface';

/**
 * Credits Routes
 * Freelancer credits management endpoints
 */
export class CreditsRoutes implements Route {
    public path = '/credits';
    public router = Router();
    private creditsController = new CreditsController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Get credits balance
        this.router.get(
            `${this.path}/balance`,
            requireRole('VIDEOGRAPHER', 'VIDEO_EDITOR'),
            this.creditsController.getCreditsBalance
        );

        // Purchase credits
        this.router.post(
            `${this.path}/purchase`,
            requireRole('VIDEOGRAPHER', 'VIDEO_EDITOR'),
            validationMiddleware(PurchaseCreditsDto, 'body', false, undefined),
            this.creditsController.purchaseCredits
        );
    }
}