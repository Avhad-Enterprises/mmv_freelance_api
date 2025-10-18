// To migrate this schema: npm run migrate:schema -- robotstxt [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- robotstxt
//    - Creates/updates the robots_txt table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- robotstxt --drop
//    - Completely drops and recreates the robots_txt table from scratch
//
import DB from './index';

export const ROBOTS_TXT = 'robots_txt';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTableIfExists(ROBOTS_TXT);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(ROBOTS_TXT, table => {
            table.increments('id').primary(); //id
            table.text('content').notNullable();
            table.integer('updated_by').nullable();
            table.timestamp('created_at').defaultTo(DB.fn.now());
            table.timestamp('updated_at').defaultTo(DB.fn.now());

        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${ROBOTS_TXT}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log('Finished Creating Triggers');
    } catch (error) {
        console.error('Migration failed for robotstxt:', error);
        throw error;
    }
};

// Migration function for schema-based migrations
export const migrate = async (dropFirst = false) => {
    // For schema-based migrations, always ensure clean state
    await seed(true); // Always drop and recreate for clean migrations
};

// Version: 1.0.0 - Robots.txt table for search engine crawling instructions
 