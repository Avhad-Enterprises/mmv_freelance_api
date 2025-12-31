// To migrate this schema: npm run migrate:schema -- applied_projects [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- applied_projects
//    - Creates/updates the applied_projects table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- applied_projects --drop
//    - Completely drops and recreates the applied_projects table from scratch
//
import DB from './index';

export const APPLIED_PROJECTS = 'applied_projects';

// Migration function for schema-based migrations
export const migrate = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Applied Projects Table');
            await DB.schema.dropTableIfExists(APPLIED_PROJECTS);
            console.log('Dropped Applied Projects Table');
        }

        const tableExists = await DB.schema.hasTable(APPLIED_PROJECTS);
        if (!tableExists) {
            console.log('Applied Projects table does not exist, creating...');
            console.log('Creating Applied Projects Table');
            await DB.schema.createTable(APPLIED_PROJECTS, table => {
                table.increments('applied_projects_id').primary();
                table.integer("projects_task_id").notNullable()
                    .references('projects_task_id')
                    .inTable('projects_task')
                    .onDelete('CASCADE');
                table.integer("user_id").notNullable()
                    .references('user_id')
                    .inTable('users')
                    .onDelete('CASCADE');
                table.integer("freelancer_id")
                    .unsigned()
                    .nullable() // or .notNullable() if you enforce
                    .references('freelancer_id')
                    .inTable('freelancer_profiles')
                    .onDelete('CASCADE');

                table.integer("status").notNullable().defaultTo(0); // 0: pending, 1: ongoing, 2: completed
                table.text('description');
                table.decimal('bid_amount', 12, 2).nullable();
                table.text('bid_message').nullable();
                // compulsory columns
                table.boolean("is_active").defaultTo(true);
                table.boolean("is_deleted").defaultTo(false);
                table.integer("deleted_by").nullable()
                    .references('user_id')
                    .inTable('users')
                    .onDelete('SET NULL');
                table.timestamp("deleted_at").nullable();
                table.integer("created_by").nullable()
                    .references('user_id')
                    .inTable('users')
                    .onDelete('SET NULL');
                table.integer("updated_by").nullable()
                    .references('user_id')
                    .inTable('users')
                    .onDelete('SET NULL');
                table.timestamp("created_at").defaultTo(DB.fn.now());
                table.timestamp("updated_at").defaultTo(DB.fn.now());

            });
            console.log('Created Applied Projects Table');

            console.log('Creating Triggers for Applied Projects Table');
            await DB.raw(`
              CREATE TRIGGER update_timestamp
              BEFORE UPDATE
              ON ${APPLIED_PROJECTS}
              FOR EACH ROW
              EXECUTE PROCEDURE update_timestamp();
            `);
            console.log('Finished Creating Triggers');
        } else {
            console.log('Applied Projects table already exists, checking for missing columns...');

            // Check and add bid_amount column if it doesn't exist
            const hasBidAmount = await DB.schema.hasColumn(APPLIED_PROJECTS, 'bid_amount');
            if (!hasBidAmount) {
                console.log('Adding bid_amount and bid_message columns...');
                await DB.schema.alterTable(APPLIED_PROJECTS, table => {
                    table.decimal('bid_amount', 12, 2).nullable();
                    table.text('bid_message').nullable();
                });
                console.log('Added bid_amount and bid_message columns');
            } else {
                console.log('bid_amount column already exists');
            }

            // Check and add refund tracking columns
            const hasCreditsSpent = await DB.schema.hasColumn(APPLIED_PROJECTS, 'credits_spent');
            if (!hasCreditsSpent) {
                console.log('Adding credit/refund tracking columns...');
                await DB.schema.alterTable(APPLIED_PROJECTS, table => {
                    table.integer('credits_spent').defaultTo(1);
                    table.boolean('refunded').defaultTo(false);
                    table.integer('refund_amount').defaultTo(0);
                    table.string('refund_reason', 100).nullable();
                    table.timestamp('refunded_at').nullable();
                });
                console.log('Added credit/refund tracking columns');
            } else {
                console.log('Credit/refund columns already exist');
            }

            // Check and add rejection_reason column
            const hasRejectionReason = await DB.schema.hasColumn(APPLIED_PROJECTS, 'rejection_reason');
            if (!hasRejectionReason) {
                console.log('Adding rejection_reason column...');
                await DB.schema.alterTable(APPLIED_PROJECTS, table => {
                    table.text('rejection_reason').nullable();
                });
                console.log('Added rejection_reason column');
            } else {
                console.log('rejection_reason column already exists');
            }
        }
    } catch (error) {
        console.error('Migration failed for applied_projects:', error);
        throw error;
    }
};
// Version: 1.2.0 - Added rejection_reason column for application rejections
