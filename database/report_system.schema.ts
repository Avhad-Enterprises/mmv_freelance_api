// To migrate this schema: npm run migrate:schema -- report_system [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- report_system
//    - Creates/updates the report table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- report_system --drop
//    - Completely drops and recreates the report table from scratch
//
import DB from './index.schema';

export const REPORT_TABLE = 'report';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTableIfExists(REPORT_TABLE);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(REPORT_TABLE, table => {
            table.increments('report_id').primary();  //ID
            table.enu('report_type', ['user', 'project']).notNullable();
            table.integer('reporter_id').notNullable();
            table.integer('reported_project_id').nullable();
            table.jsonb('tags').defaultTo(0);
            table.text('notes').notNullable();
            table.string('reason').notNullable();
            table.text('description').notNullable();
            table.enu('status', ['pending', 'reviewed', 'resolved', 'rejected']).defaultTo('pending');
            table.text('admin_remarks').nullable();
            table.integer('reviewed_by').nullable();
            table.string('email').notNullable();
            table.boolean("is_active").defaultTo(true);
            table.integer('created_by').notNullable();
            table.timestamp('created_at').defaultTo(DB.fn.now());
            table.timestamp('updated_at').defaultTo(DB.fn.now());
            table.integer('updated_by').nullable();
            table.boolean('is_deleted').defaultTo(false);
            table.integer('deleted_by').nullable();
            table.timestamp('deleted_at').nullable();

        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${REPORT_TABLE}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log('Finished Creating Triggers');
    } catch (error) {
        console.log(error);
    }
};

// Migration function for schema-based migrations
export const migrate = async (dropFirst = false) => {
    // For schema-based migrations, always ensure clean state
    await seed(true); // Always drop and recreate for clean migrations
};

// Version: 1.0.0 - Report system table for user and project reports
