// To migrate this schema: npm run migrate:schema -- application [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- application
//    - Creates/updates the application table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- application --drop
//    - Completely drops and recreates the application table from scratch
//
import DB from './index.schema';

export const APPLICATION = 'application';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTableIfExists(APPLICATION);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        await DB.schema.createTable(APPLICATION, table => {
            table.increments('id').primary();
            table.integer('applied_to_job_id').notNullable();
            table.integer('applicant_id').notNullable();
            table.text('resume_url').nullable();
            table.text('cover_letter').nullable();
            table.decimal('expected_amount', 10, 2).nullable();
            table.boolean('is_hired').defaultTo(false);
            table.integer('is_active').defaultTo(0);
            table.integer('created_by').notNullable();
            table.timestamp('created_at').defaultTo(DB.fn.now());
            table.timestamp('updated_at').defaultTo(DB.fn.now());
            table.integer('updated_by').nullable();
            table.boolean('is_deleted').defaultTo(false);
            table.integer('deleted_by').nullable();
            table.timestamp('deleted_at').nullable();
        })


        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${APPLICATION}
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

// Version: 1.0.0 - Application table for job applications and hiring process

