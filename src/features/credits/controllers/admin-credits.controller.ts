/**
 * Admin Credits Controller
 * Administrative endpoints for credit management
 */

import { Response, NextFunction } from 'express';
import DB, { T } from "../../../../database/index";
import { RequestWithUser } from '../../../interfaces/auth.interface';
import HttpException from '../../../exceptions/HttpException';
import { CreditLoggerService, CreditRefundService, RefundReason } from '../services';
import { CREDIT_CONFIG } from '../constants';

export class AdminCreditsController {
    private logger = new CreditLoggerService();
    private refundService = new CreditRefundService();

    /**
     * Get all credit transactions
     * GET /api/v1/admin/credits/transactions
     */
    public getAllTransactions = async (
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const {
                page = 1,
                limit = 50,
                user_id,
                type,
                from,
                to,
                sort_by = 'created_at',
                sort_order = 'desc'
            } = req.query;

            let query = DB(T.CREDIT_TRANSACTIONS_TABLE)
                .leftJoin('users', 'credit_transactions.user_id', 'users.user_id')
                .select(
                    'credit_transactions.*',
                    'users.email',
                    'users.first_name',
                    'users.last_name'
                );

            if (user_id) query = query.where('credit_transactions.user_id', user_id);
            if (type) query = query.where('transaction_type', type);
            if (from) query = query.where('credit_transactions.created_at', '>=', new Date(from as string));
            if (to) query = query.where('credit_transactions.created_at', '<=', new Date(to as string));

            const countQuery = query.clone().clearSelect();
            const result = await countQuery.count('* as count').first();
            const count = result ? result.count : 0;

            const effectiveLimit = Math.min(Number(limit), 100);

            const transactions = await query
                .orderBy(`credit_transactions.${sort_by}`, sort_order as string)
                .limit(effectiveLimit)
                .offset((Number(page) - 1) * effectiveLimit);

            res.status(200).json({
                success: true,
                data: {
                    transactions,
                    pagination: {
                        total: Number(count),
                        page: Number(page),
                        limit: effectiveLimit,
                        totalPages: Math.ceil(Number(count) / effectiveLimit)
                    }
                },
                message: "Transactions retrieved successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Adjust user credits
     * POST /api/v1/admin/credits/adjust
     */
    public adjustCredits = async (
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const adminUserId = req.user.user_id;
            const { user_id, amount, reason } = req.body;

            if (!user_id || amount === undefined || !reason) {
                throw new HttpException(400, 'user_id, amount, and reason are required');
            }

            if (!Number.isInteger(amount) || amount === 0) {
                throw new HttpException(400, 'Amount must be a non-zero integer');
            }

            const result = await DB.transaction(async (trx) => {
                const profile = await trx(T.FREELANCER_PROFILES)
                    .where({ user_id })
                    .select('credits_balance', 'credits_used', 'total_credits_purchased')
                    .forUpdate()
                    .first();

                if (!profile) throw new HttpException(404, 'Freelancer profile not found');

                const newBalance = profile.credits_balance + amount;

                if (newBalance < 0) {
                    throw new HttpException(400, 'Adjustment would result in negative balance');
                }

                if (amount > 0 && newBalance > CREDIT_CONFIG.MAX_BALANCE) {
                    throw new HttpException(400, `Would exceed maximum balance of ${CREDIT_CONFIG.MAX_BALANCE}`);
                }

                const updateData: any = {
                    credits_balance: newBalance,
                    updated_at: trx.fn.now()
                };

                if (amount > 0) {
                    updateData.total_credits_purchased = profile.total_credits_purchased + amount;
                } else {
                    updateData.credits_used = profile.credits_used + Math.abs(amount);
                }

                await trx(T.FREELANCER_PROFILES).where({ user_id }).update(updateData);

                await this.logger.log({
                    user_id,
                    transaction_type: amount > 0 ? 'admin_add' : 'admin_deduct',
                    amount,
                    balance_before: profile.credits_balance,
                    balance_after: newBalance,
                    reference_type: 'admin',
                    admin_user_id: adminUserId,
                    admin_reason: reason,
                    description: `Admin ${amount > 0 ? 'added' : 'deducted'} ${Math.abs(amount)} credits`
                }, trx);

                return { previousBalance: profile.credits_balance, adjustment: amount, newBalance };
            });

            const user = await DB(T.USERS_TABLE)
                .where({ user_id })
                .select('email', 'first_name', 'last_name')
                .first();

            res.status(200).json({
                success: true,
                data: {
                    user: { user_id, email: user?.email, name: `${user?.first_name} ${user?.last_name}` },
                    ...result,
                    adjusted_by: adminUserId
                },
                message: `Successfully ${amount > 0 ? 'added' : 'deducted'} ${Math.abs(amount)} credits`
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get credit analytics
     * GET /api/v1/admin/credits/analytics
     */
    public getAnalytics = async (
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { from, to } = req.query;
            const endDate = to ? new Date(to as string) : new Date();
            const startDate = from ? new Date(from as string) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

            const [totalCirculation, totalRevenue, transactionsByType, dailyStats, topUsers] = await Promise.all([
                DB(T.FREELANCER_PROFILES).sum('credits_balance as total').first(),
                DB(T.CREDIT_TRANSACTIONS_TABLE).where('transaction_type', 'purchase').sum('payment_amount as total').first(),
                DB(T.CREDIT_TRANSACTIONS_TABLE)
                    .whereBetween('created_at', [startDate, endDate])
                    .select('transaction_type')
                    .count('* as count')
                    .sum('amount as total_amount')
                    .groupBy('transaction_type'),
                DB(T.CREDIT_TRANSACTIONS_TABLE)
                    .where('created_at', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
                    .select(DB.raw("DATE(created_at) as date"))
                    .count('* as transactions')
                    .groupBy(DB.raw("DATE(created_at)"))
                    .orderBy('date', 'desc'),
                DB(T.FREELANCER_PROFILES)
                    .join('users', 'freelancer_profiles.user_id', 'users.user_id')
                    .select('freelancer_profiles.user_id', 'users.email', 'freelancer_profiles.total_credits_purchased')
                    .orderBy('total_credits_purchased', 'desc')
                    .limit(10)
            ]);

            res.status(200).json({
                success: true,
                data: {
                    overview: {
                        credits_in_circulation: Number(totalCirculation?.total) || 0,
                        total_revenue_inr: Number(totalRevenue?.total) || 0,
                        price_per_credit: CREDIT_CONFIG.PRICE_PER_CREDIT
                    },
                    transactions_by_type: transactionsByType,
                    daily_stats: dailyStats,
                    top_users: topUsers,
                    period: { from: startDate, to: endDate }
                },
                message: "Analytics retrieved successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get specific user's credit info
     * GET /api/v1/admin/credits/user/:user_id
     */
    public getUserCredits = async (
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { user_id } = req.params;

            const [profile, user, recentTransactions] = await Promise.all([
                DB(T.FREELANCER_PROFILES).where({ user_id }).first(),
                DB(T.USERS_TABLE).where({ user_id }).first(),
                DB(T.CREDIT_TRANSACTIONS_TABLE).where({ user_id }).orderBy('created_at', 'desc').limit(20)
            ]);

            if (!profile || !user) throw new HttpException(404, 'User not found');

            res.status(200).json({
                success: true,
                data: {
                    user: { user_id: Number(user_id), email: user.email, name: `${user.first_name} ${user.last_name}` },
                    credits: profile,
                    recent_transactions: recentTransactions
                },
                message: "User credit info retrieved successfully"
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Process bulk refunds for cancelled project
     * POST /api/v1/admin/credits/refund-project/:project_id
     */
    public refundProject = async (
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const adminUserId = req.user.user_id;
            const { project_id } = req.params;

            const project = await DB(T.PROJECTS_TASK).where({ projects_task_id: project_id }).first();
            if (!project) throw new HttpException(404, 'Project not found');

            const result = await this.refundService.processProjectCancellationRefunds(Number(project_id), adminUserId);

            res.status(200).json({
                success: true,
                data: {
                    project_id: Number(project_id),
                    project_title: project.project_title,
                    refunds_processed: result.refunded,
                    total_applications: result.total
                },
                message: `Refunded ${result.refunded} of ${result.total} applications`
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * Export transactions as CSV
     * GET /api/v1/admin/credits/export
     */
    public exportTransactions = async (
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { from, to, type } = req.query;

            let query = DB(T.CREDIT_TRANSACTIONS_TABLE)
                .join('users', 'credit_transactions.user_id', 'users.user_id')
                .select('credit_transactions.*', 'users.email', 'users.first_name', 'users.last_name')
                .orderBy('created_at', 'desc');

            if (from) query = query.where('credit_transactions.created_at', '>=', new Date(from as string));
            if (to) query = query.where('credit_transactions.created_at', '<=', new Date(to as string));
            if (type) query = query.where('transaction_type', type);

            const transactions = await query.limit(10000);

            const headers = ['Transaction ID', 'User ID', 'Email', 'Name', 'Type', 'Amount', 'Balance After', 'Date'];
            const rows = transactions.map((t: any) => [
                t.transaction_id, t.user_id, t.email, `${t.first_name} ${t.last_name}`,
                t.transaction_type, t.amount, t.balance_after, new Date(t.created_at).toISOString()
            ]);

            const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=credit_transactions_${Date.now()}.csv`);
            res.send(csv);
        } catch (error) {
            next(error);
        }
    };
}

export default AdminCreditsController;
