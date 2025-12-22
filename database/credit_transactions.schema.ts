/**
 * Credit Transactions Schema
 * Audit trail for all credit operations
 * 
 * This table logs every credit-related action:
 * - Purchases (credits added after payment)
 * - Deductions (credits spent on applications)
 * - Refunds (credits returned)
 * - Admin adjustments (manual add/deduct)
 */

import DB from './index';

export const CREDIT_TRANSACTIONS_TABLE = 'credit_transactions';

export const migrate = async (dropFirst = false) => {
    if (dropFirst) {
        await DB.schema.dropTableIfExists(CREDIT_TRANSACTIONS_TABLE);
    }

    const exists = await DB.schema.hasTable(CREDIT_TRANSACTIONS_TABLE);

    if (!exists) {
        await DB.schema.createTable(CREDIT_TRANSACTIONS_TABLE, (table) => {
            // Primary key
            table.increments('transaction_id').primary();

            // User reference
            table.integer('user_id').notNullable()
                .references('user_id').inTable('users').onDelete('CASCADE');

            // Transaction type
            table.enu('transaction_type', [
                'purchase',      // Credits bought
                'deduction',     // Credits spent on application
                'refund',        // Credits returned
                'admin_add',     // Admin added credits
                'admin_deduct',  // Admin removed credits
                'expiry'         // Credits expired (future use)
            ]).notNullable();

            // Amount (positive for add, negative for deduct)
            table.integer('amount').notNullable();

            // Balance tracking
            table.integer('balance_before').notNullable();
            table.integer('balance_after').notNullable();

            // Reference tracking (what triggered this transaction)
            table.string('reference_type', 50); // 'payment', 'application', 'admin', 'system'
            table.integer('reference_id');       // ID of related entity

            // Payment details (for purchases)
            table.string('payment_gateway', 50);          // 'razorpay'
            table.string('payment_order_id', 255);        // Razorpay order ID
            table.string('payment_transaction_id', 255);  // Razorpay payment ID
            table.decimal('payment_amount', 12, 2);       // Amount in INR
            table.string('payment_currency', 3).defaultTo('INR');

            // Package details (for purchases)
            table.integer('package_id');
            table.string('package_name', 100);

            // Admin adjustment details
            table.integer('admin_user_id').references('user_id').inTable('users');
            table.text('admin_reason');

            // Metadata
            table.string('ip_address', 45);
            table.text('user_agent');
            table.text('description');

            // Timestamps
            table.timestamp('created_at').defaultTo(DB.fn.now());

            // Indexes for common queries
            table.index(['user_id', 'created_at'], 'idx_credit_tx_user_date');
            table.index('transaction_type', 'idx_credit_tx_type');
            table.index(['reference_type', 'reference_id'], 'idx_credit_tx_reference');
            table.index('payment_transaction_id', 'idx_credit_tx_payment_id');
        });

        console.log(`✅ Created table: ${CREDIT_TRANSACTIONS_TABLE}`);
    } else {
        console.log(`ℹ️ Table already exists: ${CREDIT_TRANSACTIONS_TABLE}`);
    }
};

export const rollback = async () => {
    await DB.schema.dropTableIfExists(CREDIT_TRANSACTIONS_TABLE);
    console.log(`🗑️ Dropped table: ${CREDIT_TRANSACTIONS_TABLE}`);
};

export default { migrate, rollback, CREDIT_TRANSACTIONS_TABLE };
