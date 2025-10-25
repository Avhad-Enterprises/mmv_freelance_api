// To migrate this schema: npm run migrate:schema -- notification [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- notification
//    - Creates/updates the notification table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- notification --drop
//    - Completely drops and recreates the notification table from scratch
//
import DB from './index';

export const NOTIFICATION = 'notification';

export const migrate = async (dropFirst = false) => {
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
            // Allow longer redirect URLs
            table.text('redirect_url').nullable();
            // Flexible JSON metadata for extensibility (actor id, extra context, etc.)
            table.json('meta').nullable();
            table.boolean('is_read').defaultTo(false);
            table.timestamp('read_at').nullable();
            // Timestamps for auditing; trigger `update_timestamp` will update `updated_at`
            table.timestamp('created_at').defaultTo(DB.fn.now());
            table.timestamp('updated_at').defaultTo(DB.fn.now());
        });

        // Indexes to speed up common queries (by user and unread counts, and polymorphic lookups)
        await DB.schema.alterTable(NOTIFICATION, table => {
            table.index(['user_id'], 'notification_user_id_idx');
            table.index(['user_id', 'is_read'], 'notification_user_id_is_read_idx');
            table.index(['related_type', 'related_id'], 'notification_related_idx');
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
        console.error('Migration failed for notification:', error);
        throw error;
    }
};

// Version: 1.0.0 - Notifications table for user alerts and messages

