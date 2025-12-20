/**
 * Credit Logger Service
 * Logs all credit transactions for audit trail and history
 */

import DB, { T } from "../../../../database/index";
import {
    CreditLogEntry,
    CreditHistoryEntry,
    CreditHistoryOptions,
    CreditTransactionType
} from "../interfaces";

export class CreditLoggerService {

    /**
     * Log a credit transaction
     */
    async log(entry: CreditLogEntry, trx?: any): Promise<number> {
        const db = trx || DB;

        const [result] = await db(T.CREDIT_TRANSACTIONS_TABLE)
            .insert({
                user_id: entry.user_id,
                transaction_type: entry.transaction_type,
                amount: entry.amount,
                balance_before: entry.balance_before,
                balance_after: entry.balance_after,
                reference_type: entry.reference_type,
                reference_id: entry.reference_id,
                payment_gateway: entry.payment_gateway,
                payment_order_id: entry.payment_order_id,
                payment_transaction_id: entry.payment_transaction_id,
                payment_amount: entry.payment_amount,
                payment_currency: entry.payment_currency || 'INR',
                package_id: entry.package_id,
                package_name: entry.package_name,
                admin_user_id: entry.admin_user_id,
                admin_reason: entry.admin_reason,
                ip_address: entry.ip_address,
                user_agent: entry.user_agent,
                description: entry.description,
                created_at: new Date()
            })
            .returning('transaction_id');

        return result.transaction_id || result;
    }

    /**
     * Get credit history for a user
     */
    async getHistory(
        user_id: number,
        options: CreditHistoryOptions = {}
    ): Promise<CreditHistoryEntry[]> {
        const { limit = 20, offset = 0, type, from, to } = options;

        let query = DB(T.CREDIT_TRANSACTIONS_TABLE)
            .where({ user_id })
            .select(
                'transaction_id',
                'transaction_type',
                'amount',
                'balance_before',
                'balance_after',
                'reference_type',
                'reference_id',
                'description',
                'package_name',
                'payment_amount',
                'created_at'
            )
            .orderBy('created_at', 'desc');

        if (type) {
            query = query.where('transaction_type', type);
        }
        if (from) {
            query = query.where('created_at', '>=', from);
        }
        if (to) {
            query = query.where('created_at', '<=', to);
        }

        query = query.limit(limit).offset(offset);
        const results = await query;

        return results.map((row: any) => ({
            ...row,
            description: row.description || this.getDefaultDescription(row)
        }));
    }

    /**
     * Get total count of transactions for pagination
     */
    async getHistoryCount(
        user_id: number,
        options: Pick<CreditHistoryOptions, 'type' | 'from' | 'to'> = {}
    ): Promise<number> {
        const { type, from, to } = options;

        let query = DB(T.CREDIT_TRANSACTIONS_TABLE)
            .where({ user_id })
            .count('transaction_id as count');

        if (type) query = query.where('transaction_type', type);
        if (from) query = query.where('created_at', '>=', from);
        if (to) query = query.where('created_at', '<=', to);

        const [result] = await query;
        return Number(result.count);
    }

    /**
     * Check if a payment has already been processed (idempotency)
     */
    async isPaymentProcessed(payment_transaction_id: string): Promise<boolean> {
        const existing = await DB(T.CREDIT_TRANSACTIONS_TABLE)
            .where({ payment_transaction_id })
            .first();
        return !!existing;
    }

    /**
     * Get transaction by payment ID
     */
    async getByPaymentId(payment_transaction_id: string): Promise<any | null> {
        return await DB(T.CREDIT_TRANSACTIONS_TABLE)
            .where({ payment_transaction_id })
            .first();
    }

    /**
     * Generate default description based on transaction type
     */
    private getDefaultDescription(transaction: any): string {
        const { transaction_type, amount, package_name, reference_id } = transaction;

        switch (transaction_type) {
            case 'purchase':
                return package_name
                    ? `Purchased ${package_name} package (+${Math.abs(amount)} credits)`
                    : `Purchased ${Math.abs(amount)} credits`;
            case 'deduction':
                return `Applied to project #${reference_id} (-${Math.abs(amount)} credit)`;
            case 'refund':
                return `Refund for application #${reference_id} (+${Math.abs(amount)} credit)`;
            case 'admin_add':
                return `Admin credit adjustment (+${Math.abs(amount)} credits)`;
            case 'admin_deduct':
                return `Admin credit adjustment (-${Math.abs(amount)} credits)`;
            case 'expiry':
                return `Credits expired (-${Math.abs(amount)} credits)`;
            default:
                return `Credit transaction (${amount > 0 ? '+' : ''}${amount})`;
        }
    }
}

export default CreditLoggerService;
