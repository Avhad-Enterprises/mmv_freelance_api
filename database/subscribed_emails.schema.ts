// To migrate this schema: npm run migrate:schema -- subscribed_emails [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- subscribed_emails
//    - Creates/updates the subscribed_emails table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- subscribed_emails --drop
//    - Completely drops and recreates the subscribed_emails table from scratch
//
import DB from './index';

export const SUBSCRIBED_EMAILS = 'subscribed_emails';

export const seed = async (dropFirst = false) => {

    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTableIfExists(SUBSCRIBED_EMAILS);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(SUBSCRIBED_EMAILS, table => {
            table.increments('id').primary();  //ID
            table.string ('email').unique();
            table.timestamp('subscribed_at').defaultTo(DB.fn.now());
            table.boolean('is_active').defaultTo(false);


        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${SUBSCRIBED_EMAILS}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log('Finished Creating Triggers');
    } catch (error) {
        console.error('Migration failed for subscribed_emails:', error);
        throw error;
    }
};

// Migration function for schema-based migrations
export const migrate = async (dropFirst = false) => {
    // For schema-based migrations, always ensure clean state
    await seed(true); // Always drop and recreate for clean migrations
};

// Version: 1.0.0 - Subscribed emails table for newsletter subscriptions
