// To migrate this schema: npm run migrate:schema -- project_bids [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- project_bids
//    - Creates/updates the project_bids table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- project_bids --drop
//    - Completely drops and recreates the project_bids table from scratch
//
import DB from './index';

export const PROJECT_BIDS = 'project_bids';

export const migrate = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Project Bids Table');
            await DB.schema.dropTableIfExists(PROJECT_BIDS);
            console.log('Dropped Project Bids Table');
        }

        console.log('Creating Project Bids Table');
        await DB.schema.createTable(PROJECT_BIDS, table => {
            table.increments('bid_id').primary();
            
            // Relations
            table.integer('project_id').notNullable()
                .references('projects_task_id')
                .inTable('projects_task')
                .onDelete('CASCADE');
            table.integer('freelancer_id').notNullable()
                .references('freelancer_id')
                .inTable('freelancer_profiles')
                .onDelete('CASCADE');
            table.integer('application_id').notNullable()
                .references('applied_projects_id')
                .inTable('applied_projects')
                .onDelete('CASCADE');
            
            // Bid Details
            table.decimal('bid_amount', 12, 2).notNullable();
            table.integer('delivery_time_days').notNullable();
            table.text('proposal').notNullable();
            table.jsonb('milestones').nullable();
            
            // Bid Status
            table.enum('status', ['pending', 'accepted', 'rejected', 'withdrawn'])
                .defaultTo('pending')
                .notNullable();
            
            // Additional Features
            table.boolean('is_featured').defaultTo(false);
            table.timestamp('featured_until').nullable();
            table.jsonb('additional_services').nullable();
            
            // Standard Fields
            table.boolean('is_active').defaultTo(true);
            table.boolean('is_deleted').defaultTo(false);
            table.integer('created_by').notNullable()
                .references('user_id')
                .inTable('users')
                .onDelete('SET NULL');
            table.timestamp('created_at').defaultTo(DB.fn.now());
            table.timestamp('updated_at').defaultTo(DB.fn.now());
            table.integer('updated_by').nullable()
                .references('user_id')
                .inTable('users')
                .onDelete('SET NULL');
            table.integer('deleted_by').nullable()
                .references('user_id')
                .inTable('users')
                .onDelete('SET NULL');
            table.timestamp('deleted_at').nullable();
        });

        // Indexes for performance
        await DB.schema.alterTable(PROJECT_BIDS, table => {
            table.index(['project_id', 'status'], 'idx_project_bids_project_status');
            table.index(['freelancer_id', 'status'], 'idx_project_bids_freelancer_status');
            table.index(['created_at'], 'idx_project_bids_created_at');
        });

        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${PROJECT_BIDS}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log('Finished Creating Triggers');
    } catch (error) {
        console.error('Migration failed for project_bids:', error);
        throw error;
    }
};

// Version: 1.0.0 - Project bids table for managing freelancer bids on projects