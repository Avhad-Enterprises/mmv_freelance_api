// To migrate this schema: npm run migrate:schema -- transactions [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- transactions
//    - Creates/updates the transactions table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- transactions --drop
//    - Completely drops and recreates the transactions table from scratch
//
import DB, { T } from "./index";

export const TRANSACTION_TABLE = "transactions";

export const migrate = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log("Dropping Table...");
            await DB.schema.dropTableIfExists(TRANSACTION_TABLE);
            console.log("Dropped Table!");
        }
        console.log("Seeding Tables...");

        await DB.schema.createTable(TRANSACTION_TABLE, (table) => {
            table.increments("id").primary();
            table
                .enu("transaction_type", ["escrow", "payout", "refund"])
                .notNullable();
            table
                .enu("transaction_status", ["pending", "completed", "failed"])
                .notNullable();
            table
                .integer("project_id")
                .references("projects_task_id")
                .inTable(T.PROJECTS_TASK)
                .onDelete("CASCADE");
            table
                .integer("application_id")
                .nullable()
                .references("applied_projects_id")
                .inTable(T.APPLIED_PROJECTS)
                .onDelete("CASCADE"); // References the applied_projects record for this transaction (optional for payouts/refunds)

            table
                .integer("payer_id")
                .references("user_id")
                .inTable(T.USERS_TABLE)
                .onDelete('CASCADE');
            table
                .integer("payee_id")
                .references("user_id")
                .inTable(T.USERS_TABLE)
                .onDelete('CASCADE');
            table.decimal("amount", 12, 2);
            table.string("currency").defaultTo("INR"); // INR, US $ etc.
            table.string("payment_gateway"); // Razorpay or Stripe
            table.string("gateway_transaction_id");
            table.text("description");
            table.timestamp("created_at").defaultTo(DB.fn.now());
        });

        console.log("Finished Seeding Tables");

        console.log("Finished Creating Triggers");
    } catch (error) {
        console.error('Migration failed for transactions:', error);
        throw error;
    }
};

// Version: 1.0.0 - Transactions table for payment and financial records
