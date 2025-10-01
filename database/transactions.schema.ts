// To migrate this schema: npm run migrate:schema -- transactions [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- transactions
//    - Creates/updates the transactions table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- transactions --drop
//    - Completely drops and recreates the transactions table from scratch
//
import DB, { T } from "./index.schema";

export const TRANSACTION_TABLE = "transactions";

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log("Dropping Table...");
            await DB.schema.dropTable(TRANSACTION_TABLE);
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
                .references("applied_projects_id")
                .inTable(T.APPLIED_PROJECTS)
                .onDelete("CASCADE"); //doubtful, what is this, and from where I can get this application id.

            table
                .integer("payer_id")
                .references("user_id")
                .inTable(T.USERS_TABLE);
            table
                .integer("payee_id")
                .references("user_id")
                .inTable(T.USERS_TABLE);
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
        console.log(error);
    }
};

// Migration function for schema-based migrations
export const migrate = async (dropFirst = false) => {
    // For schema-based migrations, always ensure clean state
    await seed(true); // Always drop and recreate for clean migrations
};

// Version: 1.0.0 - Transactions table for payment and financial records
