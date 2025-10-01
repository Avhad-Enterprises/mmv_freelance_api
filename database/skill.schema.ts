// To migrate this schema: npm run migrate:schema -- skill [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- skill
//    - Creates/updates the skills table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- skill --drop
//    - Completely drops and recreates the skills table from scratch
//
import DB from './index.schema';

export const SKILLS = 'skills';

export const seed = async (dropFirst = false) => {

    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(SKILLS);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(SKILLS, table => {
            table.increments('skill_id').primary(); // ID
            table.string('skill_name').notNullable();

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
          ON ${SKILLS}
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

// Version: 1.0.0 - Skills lookup table for freelancer skills
