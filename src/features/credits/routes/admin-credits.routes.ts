/**
 * Admin Credits Routes
 * Administrative endpoints for credit management
 */

import { Router } from 'express';
import { AdminCreditsController } from '../controllers';
import { requireRole } from '../../../middlewares/role.middleware';
import validationMiddleware from '../../../middlewares/validation.middleware';
import { AdminCreditAdjustmentDto } from '../dto';
import Route from '../../../interfaces/route.interface';

export class AdminCreditsRoutes implements Route {
    public path = '/admin/credits';
    public router = Router();
    private controller = new AdminCreditsController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        const adminAuth = requireRole('ADMIN', 'SUPER_ADMIN');

        // GET /api/v1/admin/credits/transactions
        this.router.get(
            `${this.path}/transactions`,
            adminAuth,
            this.controller.getAllTransactions
        );

        // POST /api/v1/admin/credits/adjust
        this.router.post(
            `${this.path}/adjust`,
            adminAuth,
            validationMiddleware(AdminCreditAdjustmentDto, 'body', false, undefined),
            this.controller.adjustCredits
        );

        // GET /api/v1/admin/credits/analytics
        this.router.get(
            `${this.path}/analytics`,
            adminAuth,
            this.controller.getAnalytics
        );

        // GET /api/v1/admin/credits/user/:user_id
        this.router.get(
            `${this.path}/user/:user_id`,
            adminAuth,
            this.controller.getUserCredits
        );

        // POST /api/v1/admin/credits/refund-project/:project_id
        this.router.post(
            `${this.path}/refund-project/:project_id`,
            adminAuth,
            this.controller.refundProject
        );

        // GET /api/v1/admin/credits/export
        this.router.get(
            `${this.path}/export`,
            adminAuth,
            this.controller.exportTransactions
        );
    }
}

export default AdminCreditsRoutes;
