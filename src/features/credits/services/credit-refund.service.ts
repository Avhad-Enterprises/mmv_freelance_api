/**
 * Credit Refund Service
 * Handles credit refunds for withdrawn applications and cancelled projects
 */

import DB, { T } from "../../../../database/index";
import HttpException from "../../../exceptions/HttpException";
import { CreditLoggerService } from "./credit-logger.service";
import { CREDIT_CONFIG } from "../constants";
import { RefundReason, RefundEligibility, RefundResult } from "../interfaces";

// Re-export RefundReason for external use
export { RefundReason };

export class CreditRefundService {
    private logger = new CreditLoggerService();

    /**
     * Check if an application is eligible for refund
     */
    async checkRefundEligibility(
        applicationId: number,
        userId: number,
        reason: RefundReason
    ): Promise<RefundEligibility> {
        const application = await DB(T.APPLIED_PROJECTS)
            .where({
                applied_projects_id: applicationId,
                user_id: userId,
                is_deleted: false
            })
            .first();

        if (!application) {
            return {
                eligible: false,
                refundAmount: 0,
                refundPercent: 0,
                reason: 'Application not found',
                originalCredits: 0
            };
        }

        if (application.refunded) {
            return {
                eligible: false,
                refundAmount: 0,
                refundPercent: 0,
                reason: 'Application already refunded',
                originalCredits: application.credits_spent || 1
            };
        }

        const creditsSpent = application.credits_spent || 1;
        const refundResult = this.calculateRefundAmount(application, reason);

        return {
            eligible: refundResult.amount > 0,
            refundAmount: refundResult.amount,
            refundPercent: refundResult.percent,
            reason: refundResult.reason,
            originalCredits: creditsSpent
        };
    }

    /**
     * Calculate refund amount based on reason and timing
     */
    private calculateRefundAmount(
        application: any,
        reason: RefundReason
    ): { amount: number; percent: number; reason: string } {
        const creditsSpent = application.credits_spent || 1;
        const createdAt = new Date(application.created_at);
        const now = new Date();
        const minutesSinceApplication = (now.getTime() - createdAt.getTime()) / (1000 * 60);
        const hoursSinceApplication = minutesSinceApplication / 60;

        // Full refund cases
        if (
            reason === RefundReason.PROJECT_CANCELLED ||
            reason === RefundReason.PROJECT_EXPIRED ||
            reason === RefundReason.TECHNICAL_ERROR ||
            reason === RefundReason.ADMIN_REFUND ||
            reason === RefundReason.DUPLICATE_APPLICATION
        ) {
            return { amount: creditsSpent, percent: 100, reason: 'Full refund approved' };
        }

        // Withdrawal refund (time-based)
        if (reason === RefundReason.WITHDRAWAL) {
            if (minutesSinceApplication <= CREDIT_CONFIG.FULL_REFUND_MINUTES) {
                return {
                    amount: creditsSpent,
                    percent: 100,
                    reason: `Full refund (within ${CREDIT_CONFIG.FULL_REFUND_MINUTES} minutes)`
                };
            }

            if (hoursSinceApplication <= CREDIT_CONFIG.PARTIAL_REFUND_HOURS) {
                const refundAmount = Math.floor(creditsSpent * CREDIT_CONFIG.PARTIAL_REFUND_PERCENT / 100);
                return {
                    amount: refundAmount,
                    percent: CREDIT_CONFIG.PARTIAL_REFUND_PERCENT,
                    reason: `Partial refund (${CREDIT_CONFIG.PARTIAL_REFUND_PERCENT}% within ${CREDIT_CONFIG.PARTIAL_REFUND_HOURS}h)`
                };
            }

            return { amount: 0, percent: 0, reason: 'Refund period expired (over 24 hours)' };
        }

        return { amount: 0, percent: 0, reason: 'Unknown refund reason' };
    }

    /**
     * Process refund for an application
     */
    async processRefund(
        applicationId: number,
        userId: number,
        reason: RefundReason,
        adminUserId?: number,
        adminNote?: string
    ): Promise<RefundResult> {
        const eligibility = await this.checkRefundEligibility(applicationId, userId, reason);

        if (!eligibility.eligible) {
            throw new HttpException(400, {
                code: 'REFUND_NOT_ELIGIBLE',
                message: eligibility.reason || 'Refund not eligible',
                originalCredits: eligibility.originalCredits
            });
        }

        return await DB.transaction(async (trx) => {
            const application = await trx(T.APPLIED_PROJECTS)
                .where({ applied_projects_id: applicationId })
                .forUpdate()
                .first();

            if (application.refunded) {
                throw new HttpException(400, 'Application already refunded');
            }

            const profile = await trx(T.FREELANCER_PROFILES)
                .where({ user_id: userId })
                .select('credits_balance', 'credits_used')
                .forUpdate()
                .first();

            if (!profile) {
                throw new HttpException(404, 'Freelancer profile not found');
            }

            const newBalance = profile.credits_balance + eligibility.refundAmount;
            const newCreditsUsed = Math.max(0, profile.credits_used - eligibility.refundAmount);

            await trx(T.FREELANCER_PROFILES)
                .where({ user_id: userId })
                .update({
                    credits_balance: newBalance,
                    credits_used: newCreditsUsed,
                    updated_at: trx.fn.now()
                });

            await trx(T.APPLIED_PROJECTS)
                .where({ applied_projects_id: applicationId })
                .update({
                    refunded: true,
                    refund_amount: eligibility.refundAmount,
                    refund_reason: reason,
                    refunded_at: trx.fn.now(),
                    updated_at: trx.fn.now()
                });

            await this.logger.log({
                user_id: userId,
                transaction_type: 'refund',
                amount: eligibility.refundAmount,
                balance_before: profile.credits_balance,
                balance_after: newBalance,
                reference_type: 'application',
                reference_id: applicationId,
                admin_user_id: adminUserId,
                admin_reason: adminNote,
                description: `Refund for application #${applicationId}: ${eligibility.reason}`
            }, trx);

            return {
                success: true,
                refundAmount: eligibility.refundAmount,
                newBalance: newBalance,
                message: `Refunded ${eligibility.refundAmount} credit(s) (${eligibility.refundPercent}%)`
            };
        });
    }

    /**
     * Process bulk refunds for project cancellation
     */
    async processProjectCancellationRefunds(
        projectId: number,
        adminUserId?: number
    ): Promise<{ refunded: number; total: number }> {
        const applications = await DB(T.APPLIED_PROJECTS)
            .where({
                projects_task_id: projectId,
                is_deleted: false,
                refunded: false
            })
            .select('applied_projects_id', 'user_id');

        let refundedCount = 0;

        for (const app of applications) {
            try {
                await this.processRefund(
                    app.applied_projects_id,
                    app.user_id,
                    RefundReason.PROJECT_CANCELLED,
                    adminUserId,
                    `Project #${projectId} cancelled`
                );
                refundedCount++;
            } catch (error) {
                console.error(`Failed to refund application ${app.applied_projects_id}:`, error);
            }
        }

        return { refunded: refundedCount, total: applications.length };
    }

    /**
     * Get refund history for a user
     */
    async getUserRefunds(userId: number): Promise<any[]> {
        return await DB(T.APPLIED_PROJECTS)
            .where({ user_id: userId, refunded: true })
            .join(T.PROJECTS_TASK, 'applied_projects.projects_task_id', 'projects_task.projects_task_id')
            .select(
                'applied_projects.applied_projects_id',
                'applied_projects.credits_spent',
                'applied_projects.refund_amount',
                'applied_projects.refund_reason',
                'applied_projects.refunded_at',
                'projects_task.project_title'
            )
            .orderBy('applied_projects.refunded_at', 'desc');
    }
}

export default CreditRefundService;
