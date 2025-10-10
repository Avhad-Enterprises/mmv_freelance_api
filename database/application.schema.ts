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

// Migration function for schema-based migrations
export const migrate = async (dropFirst = false) => {
    if (dropFirst) {
        console.log('Dropping Application Table');
        await DB.schema.dropTableIfExists(APPLICATION);
        console.log('Dropped Application Table');
    }

    const tableExists = await DB.schema.hasTable(APPLICATION);
    if (!tableExists) {
        console.log('Application table does not exist, creating...');
        console.log('Creating Application Table');
        await DB.schema.createTable(APPLICATION, table => {
            table.increments('id').primary();
            table.integer('applied_to_job_id').notNullable()
                .references('projects_task_id')
                .inTable('projects_task')
                .onDelete('CASCADE');
            table.integer('applicant_id').notNullable()
                .references('user_id')
                .inTable('users')
                .onDelete('CASCADE');
            table.text('resume_url').nullable();
            table.text('cover_letter').nullable();
            table.decimal('expected_amount', 12, 2).nullable();
            table.boolean('is_hired').defaultTo(false);
            table.boolean('is_active').defaultTo(true);
            table.integer('created_by').notNullable()
                .references('user_id')
                .inTable('users')
                .onDelete('SET NULL');
            table.timestamp('created_at').defaultTo(DB.fn.now());
            table.timestamp('updated_at').defaultTo(DB.fn.now());
            table.integer('updated_by').nullable()
                .references('user_id')
                .inTable('users')
                .onDelete('SET NULL');
            table.boolean('is_deleted').defaultTo(false);
            table.integer('deleted_by').nullable()
                .references('user_id')
                .inTable('users')
                .onDelete('SET NULL');
            table.timestamp('deleted_at').nullable();
        });
        console.log('Created Application Table');
        
        console.log('Creating Triggers for Application Table');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${APPLICATION}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log('Finished Creating Triggers');
    } else {
        console.log('Application table already exists, skipping migration');
    }
};

// Version: 1.0.0 - Application table for job applications and hiring process

