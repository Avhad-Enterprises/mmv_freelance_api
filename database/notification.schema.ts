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
        const tableExists = await DB.schema.hasTable(NOTIFICATION);

        if (!tableExists) {
            console.log('Creating Notification Table');
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
        } else {
            console.log('Notification Table already exists, checking for missing columns...');

            // Check for columns sequentially outside of alterTable callback
            const hasCreatedAt = await DB.schema.hasColumn(NOTIFICATION, 'created_at');
            if (!hasCreatedAt) {
                console.log('Adding missing column: created_at');
                await DB.schema.alterTable(NOTIFICATION, table => {
                    table.timestamp('created_at').defaultTo(DB.fn.now());
                });
            }

            const hasUpdatedAt = await DB.schema.hasColumn(NOTIFICATION, 'updated_at');
            if (!hasUpdatedAt) {
                console.log('Adding missing column: updated_at');
                await DB.schema.alterTable(NOTIFICATION, table => {
                    table.timestamp('updated_at').defaultTo(DB.fn.now());
                });
            }

            const hasMeta = await DB.schema.hasColumn(NOTIFICATION, 'meta');
            if (!hasMeta) {
                console.log('Adding missing column: meta');
                await DB.schema.alterTable(NOTIFICATION, table => {
                    table.json('meta').nullable();
                });
            }
        }

        console.log('Finished Seeding Tables');

        // Check if trigger exists before creating
        const triggerExists = await DB.raw(`
            SELECT 1 
            FROM pg_trigger 
            WHERE tgname = 'update_timestamp' 
            AND tgrelid = '${NOTIFICATION}'::regclass
        `);

        if (triggerExists.rows.length === 0) {
            console.log('Creating Triggers');
            await DB.raw(`
              CREATE TRIGGER update_timestamp
              BEFORE UPDATE
              ON ${NOTIFICATION}
              FOR EACH ROW
              EXECUTE PROCEDURE update_timestamp();
            `);
            console.log('Finished Creating Triggers');
        } else {
            console.log('Trigger update_timestamp already exists, skipping.');
        }
    } catch (error) {
        console.error('Migration failed for notification:', error);
        throw error;
    }
};

// Version: 1.0.0 - Notifications table for user alerts and messages

