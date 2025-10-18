// To migrate this schema: npm run migrate:schema -- analytics_settings [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- analytics_settings
//    - Creates/updates the analytics_settings table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- analytics_settings --drop
//    - Completely drops and recreates the analytics_settings table from scratch
//
import DB from './index';

export const ANALYTICS_SETTINGS = 'analytics_settings';

export const migrate = async (dropFirst = false) => {

    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTableIfExists(ANALYTICS_SETTINGS);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(ANALYTICS_SETTINGS, table => {
            table.increments('id').primary();  //ID
            table.string ('tracking_id').notNullable();
            table.timestamp('created_at').defaultTo(DB.fn.now());
            table.timestamp('updated_at').defaultTo(DB.fn.now());
            table.boolean('is_deleted').defaultTo(false);

        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${ANALYTICS_SETTINGS}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log('Finished Creating Triggers');
    } catch (error) {
        console.error('Migration failed for analytics:', error);
        throw error;
    }
};

// Version: 1.0.0 - Analytics settings table for tracking configurations
