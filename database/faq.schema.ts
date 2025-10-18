// To migrate this schema: npm run migrate:schema -- faq [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- faq
//    - Creates/updates the faq table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- faq --drop
//    - Completely drops and recreates the faq table from scratch
//
import DB from './index';

export const FAQ = 'faq';

export const migrate = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTableIfExists(FAQ);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        await DB.schema.createTable(FAQ, table => {
            table.increments('faq_id').primary();
            table.string('type', 50).defaultTo('general');
            table.text('question').notNullable();
            table.text('answer').notNullable();
            table.jsonb('tags').nullable();
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
          ON ${FAQ}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log('Finished Creating Triggers');
    } catch (error) {
        console.log(error);
    }
};

// Version: 1.0.0 - FAQ table for frequently asked questions
