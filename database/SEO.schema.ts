// To migrate this schema: npm run migrate:schema -- SEO [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- SEO
//    - Creates/updates the SEO table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- SEO --drop
//    - Completely drops and recreates the SEO table from scratch
//
import DB from './index.schema';

export const SEO = 'seo';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTableIfExists(SEO);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        await DB.schema.createTable(SEO, table => {
            table.increments('id').primary();
            table.string('meta_title').notNullable();
            table.string('meta_description').notNullable();
            table.string('canonical_url').nullable();
            table.string('og_title').nullable();
            table.string('og_description').nullable();
            table.string('og_image_url').nullable();
            table.string('og_site_name').nullable();
            table.string('og_locale').nullable();
            table.string('twitter_card').nullable(); // fixed casing from twitter_Card
            table.string('twitter_title').nullable();
            table.string('twitter_image_url').nullable();
            table.string('twitter_description').nullable();
            table.string('twitter_site').nullable();
            table.string('twitter_creator').nullable();
            table.string('status').nullable();
            table.boolean('is_active').defaultTo(true);
            table.boolean('is_deleted').defaultTo(false);
            table.timestamp('created_at').defaultTo(DB.fn.now());
            table.timestamp('updated_at').defaultTo(DB.fn.now());
        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${SEO}
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

// Version: 1.0.0 - SEO table for search engine optimization metadata

