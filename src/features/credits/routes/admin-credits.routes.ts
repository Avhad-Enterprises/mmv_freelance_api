/**
 * Admin Credits Routes
 * Administrative endpoints for credit management
 * 
 * Uses Dynamic RBAC with permission-based access control
 */

import { Router } from 'express';
import { AdminCreditsController } from '../controllers';
import { requirePermission } from '../../../middlewares/permission.middleware';
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
        // GET /api/v1/admin/credits/transactions
        // Permission: credits.admin.view_all - View all credit transactions
        this.router.get(
            `${this.path}/transactions`,
            requirePermission('credits.admin.view_all'),
            this.controller.getAllTransactions
        );

        // POST /api/v1/admin/credits/adjust
        // Permission: credits.admin.adjust - Add/deduct credits from users
        this.router.post(
            `${this.path}/adjust`,
            requirePermission('credits.admin.adjust'),
            validationMiddleware(AdminCreditAdjustmentDto, 'body', false, undefined),
            this.controller.adjustCredits
        );

        // GET /api/v1/admin/credits/analytics
        // Permission: credits.admin.analytics - View credit system analytics
        this.router.get(
            `${this.path}/analytics`,
            requirePermission('credits.admin.analytics'),
            this.controller.getAnalytics
        );

        // GET /api/v1/admin/credits/user/:user_id
        // Permission: credits.admin.view_all - View specific user's credits
        this.router.get(
            `${this.path}/user/:user_id`,
            requirePermission('credits.admin.view_all'),
            this.controller.getUserCredits
        );

        // POST /api/v1/admin/credits/refund-project/:project_id
        // Permission: credits.admin.refund - Process project cancellation refunds
        this.router.post(
            `${this.path}/refund-project/:project_id`,
            requirePermission('credits.admin.refund'),
            this.controller.refundProject
        );

        // GET /api/v1/admin/credits/export
        // Permission: credits.admin.export - Export transactions to CSV
        this.router.get(
            `${this.path}/export`,
            requirePermission('credits.admin.export'),
            this.controller.exportTransactions
        );
    }
}

export default AdminCreditsRoutes;
