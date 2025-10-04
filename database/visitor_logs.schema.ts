// To migrate this schema: npm run migrate:schema -- visitor_logs [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- visitor_logs
//    - Creates/updates the visitor_logs table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- visitor_logs --drop
//    - Completely drops and recreates the visitor_logs table from scratch
//
import DB from './index.schema';

export const VISITOR_LOGS = 'visitor_logs';

export const seed = async (dropFirst = false) => {

    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTableIfExists(VISITOR_LOGS);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(VISITOR_LOGS, table => {
            table.increments('visitor_id').primary();  //ID
            table.string('session_id').notNullable();
            table.integer('user_id').nullable();
            table.string('ip_address').nullable();
            table.string('user_agent').nullable();
            table.string('browser_info').nullable();
            table.string('os_info').nullable();
            table.string('device_type').nullable();
            table.string('device_model').nullable();
            table.string('screen_resolution').nullable();
            table.string('browser_language').nullable();
            table.string('referrer_url').nullable();
            table.string('referrer_domain').nullable();
            table.string('entry_page').nullable();
            table.string('exit_page').nullable();
            table.string('current_url').notNullable();
            table.integer('time_spent').notNullable();
            table.integer('session_duration').nullable();
            table.boolean('bounce').defaultTo(false);
            table.integer('page_load_time').nullable();
            table.string('network_type').nullable();
            table.string('country_code').nullable();
            table.string('city').nullable();
            table.string('postal_code').nullable();
            table.string('timezone_offset').nullable();
            table.integer('clicks_count').nullable();
            table.integer('scroll_percentage').nullable();
            table.jsonb('form_interaction').nullable();
            table.jsonb('video_interaction').nullable();
            table.jsonb('actions').nullable();
            table.string('utm_source').nullable();
            table.string('utm_medium').nullable();
            table.string('utm_campaign').nullable();
            table.string('utm_term').nullable();
            table.string('utm_content').nullable();
            table.string('referral_code_used').nullable();
            table.string('platform').nullable();
            table.string('visitor_type').nullable();
            table.boolean('is_bot').defaultTo(false);
            table.string('ip_hash').nullable();
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
          ON ${VISITOR_LOGS}
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

// Version: 1.0.0 - Visitor logs table for website analytics and tracking
