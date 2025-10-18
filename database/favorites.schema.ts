// To migrate this schema: npm run migrate:schema -- favorites [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- favorites
//    - Creates/updates the favorites table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- favorites --drop
//    - Completely drops and recreates the favorites table from scratch
//
import DB from './index';

export const FAVORITES_TABLE = 'favorites';

export const migrate = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTableIfExists(FAVORITES_TABLE);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(FAVORITES_TABLE, table => {
            table.increments('id').primary();  //ID
            table.integer('user_id').notNullable();
            table.integer('freelancer_id').notNullable();
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
          ON ${FAVORITES_TABLE}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log('Finished Creating Triggers');
    } catch (error) {
        console.error('Migration failed for favorites:', error);
        throw error;
    }
};

// Version: 1.0.0 - Favorites table for user freelancer bookmarks
