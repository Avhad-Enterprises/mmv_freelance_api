// To migrate this schema: npm run migrate:schema -- tags [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- tags
//    - Creates/updates the tags table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- tags --drop
//    - Completely drops and recreates the tags table from scratch
//
import DB from './index';

export const TAGS_TABLE = 'tags';

export const migrate = async (dropFirst = false) => {

    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTableIfExists(TAGS_TABLE);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(TAGS_TABLE, table => {
            table.increments('tag_id').primary(); // ID
            table.string('tag_name').notNullable();
            table.string('tag_value').notNullable();
            table.string('tag_type').notNullable();

            // Status and Soft Delete fields
            table.boolean("is_active").defaultTo(true);
            table.integer('created_by').notNullable();
            table.timestamp('created_at').defaultTo(DB.fn.now())
            table.timestamp('updated_at').defaultTo(DB.fn.now());
            table.integer('updated_by').nullable();
            table.boolean('is_deleted').defaultTo(false);
            table.integer('deleted_by').nullable();
            table.timestamp('deleted_at').nullable();
        });

        console.log('Finished Seeding Tables');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${TAGS_TABLE}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log('Finished Creating Triggers');
    } catch (error) {
        console.error('Migration failed for tags:', error);
        throw error;
    }
};

// Version: 1.0.0 - Tags table for categorizing and labeling content
