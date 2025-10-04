// To migrate this schema: npm run migrate:schema -- notification [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- notification
//    - Creates/updates the notification table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- notification --drop
//    - Completely drops and recreates the notification table from scratch
//
import DB from './index.schema';

export const NOTIFICATION = 'notification';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTableIfExists(NOTIFICATION);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(NOTIFICATION, table => {
           table.increments('id').primary();  //ID
           table.integer('user_id').notNullable();
           table.string('title').notNullable();
           table.text('message').notNullable();
           table.string('type').notNullable();
           table.integer('related_id').nullable();
           table.string('related_type').nullable();
           table.string('redirect_url').nullable();
           table.boolean('is_read').defaultTo(0);
           table.timestamp('read_at').nullable();
        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${NOTIFICATION}
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

// Version: 1.0.0 - Notifications table for user alerts and messages

