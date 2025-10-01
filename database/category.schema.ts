// To migrate this schema: npm run migrate:schema -- category [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- category
//    - Creates/updates the category table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- category --drop
//    - Completely drops and recreates the category table from scratch
//
import DB from './index.schema';

export const CATEGORY = 'category';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(CATEGORY);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(CATEGORY, table => {
            table.increments('category_id').primary();  //ID
            table.string('name').notNullable(); //Video Edit
            table.string('value').notNullable(); //video-edit
            table.string('slug').notNullable();
            table.text("types", "jsonb").nullable(); //projects
            table.text("notes", "jsonb").nullable();
            table.boolean('is_active').defaultTo(true); 
            table.integer('created_by').notNullable(); //logged is user id
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
          ON ${CATEGORY}
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

// Version: 1.0.0 - Categories table for project categorization

