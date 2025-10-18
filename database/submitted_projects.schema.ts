// To migrate this schema: npm run migrate:schema -- submitted_projects [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- submitted_projects
//    - Creates/updates the submitted_projects table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- submitted_projects --drop
//    - Completely drops and recreates the submitted_projects table from scratch
//
import DB from './index';

export const SUBMITTED_PROJECTS = 'submitted_projects';

// Migration function for schema-based migrations
export const migrate = async (dropFirst = false) => {
    if (dropFirst) {
        console.log('Dropping Submitted Projects Table');
        await DB.schema.dropTableIfExists(SUBMITTED_PROJECTS);
        console.log('Dropped Submitted Projects Table');
    }

    const tableExists = await DB.schema.hasTable(SUBMITTED_PROJECTS);
    if (!tableExists) {
        console.log('Submitted Projects table does not exist, creating...');
        console.log('Creating Submitted Projects Table');
        await DB.schema.createTable(SUBMITTED_PROJECTS, table => {
            table.increments('submission_id').primary();
            table.integer('projects_task_id').notNullable()
                .references('projects_task_id')
                .inTable('projects_task')
                .onDelete('CASCADE');
            table.integer('user_id').notNullable()
                .references('user_id')
                .inTable('users')
                .onDelete('CASCADE');
            table.string('submitted_files').notNullable();
            table.text('additional_notes');
            table.integer("status").notNullable().defaultTo(0); // 0: Submitted, 1: Under Review, 2: Approved, 3: Rejected

            // compulsory columns
            table.boolean('is_active').defaultTo(true);
            table.boolean('is_deleted').defaultTo(false);
            table.integer('deleted_by').nullable()
                .references('user_id')
                .inTable('users')
                .onDelete('SET NULL');
            table.timestamp('deleted_at').nullable();
            table.integer('created_by').nullable()
                .references('user_id')
                .inTable('users')
                .onDelete('SET NULL');
            table.integer('updated_by').nullable()
                .references('user_id')
                .inTable('users')
                .onDelete('SET NULL');
            table.timestamp('created_at').defaultTo(DB.fn.now());
            table.timestamp('updated_at').defaultTo(DB.fn.now());
        });
        console.log('Created Submitted Projects Table');
        
        console.log('Creating Triggers for Submitted Projects Table');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${SUBMITTED_PROJECTS}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log('Finished Creating Triggers');
    } else {
        console.log('Submitted Projects table already exists, skipping migration');
    }
};

// Version: 1.0.0 - Submitted projects table for tracking completed work submissions