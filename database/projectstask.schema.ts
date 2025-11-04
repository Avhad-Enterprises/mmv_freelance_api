// To migrate this schema: npm run migrate:schema -- projectstask [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- projectstask
//    - Creates/updates the projects_task table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- projectstask --drop
//    - Completely drops and recreates the projects_task table from scratch
//
import DB from './index';

export const PROJECTS_TASK = 'projects_task';

// Migration function for schema-based migrations
export const migrate = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Projects Task Table');
            await DB.schema.dropTableIfExists(PROJECTS_TASK);
            console.log('Dropped Projects Task Table');
        }

        const tableExists = await DB.schema.hasTable(PROJECTS_TASK);
        if (!tableExists) {
            console.log('Projects Task table does not exist, creating...');
            console.log('Creating Projects Task Table');
            await DB.schema.createTable(PROJECTS_TASK, table => {
                table.increments('projects_task_id').primary();  //ID
                table.integer('client_id').notNullable()
                    .references('client_id')
                    .inTable('client_profiles')
                    .onDelete('CASCADE');
                table.integer('freelancer_id').nullable()
                    .references('freelancer_id')
                    .inTable('freelancer_profiles')
                    .onDelete('SET NULL');
                table.string('project_title').notNullable();
                table.text('project_category').notNullable();
                table.date('deadline').notNullable();
                table.integer("status").notNullable().defaultTo(0);   // 0: pending, 1: assigned, 2: completed
                table.text('project_description').notNullable();
                table.decimal('budget', 12, 2).notNullable();
                table.jsonb('tags').nullable();
                table.jsonb('skills_required').notNullable();
                table.jsonb('reference_links').notNullable();
                table.text('additional_notes').notNullable();
                table.text('projects_type').notNullable();
                table.string('project_format').notNullable();
                table.string('audio_voiceover').notNullable();
                table.text('audio_description').notNullable();
                table.integer('video_length').notNullable();
                table.text('preferred_video_style').notNullable();
                table.string('sample_project_file').nullable();
                table.jsonb('project_files').nullable();
                table.jsonb('show_all_files').defaultTo(DB.raw("'[]'::jsonb"));
                table.string('url').notNullable();
                table.string('meta_title').notNullable();
                table.text('meta_description').notNullable();
                table.timestamp('assigned_at').nullable();
                table.timestamp('completed_at').nullable();
                table.integer('application_count').defaultTo(0);
                table.jsonb('shortlisted_freelancer_ids').nullable();
                table.boolean('is_active').defaultTo(true);
                table.boolean('bidding_enabled').defaultTo(false);
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
            console.log('Created Projects Task Table');
            
            console.log('Creating Triggers for Projects Task Table');
            await DB.raw(`
              CREATE TRIGGER update_timestamp
              BEFORE UPDATE
              ON ${PROJECTS_TASK}
              FOR EACH ROW
              EXECUTE PROCEDURE update_timestamp();
            `);
            console.log('Finished Creating Triggers');
        } else {
            console.log('Projects Task table already exists, skipping migration');
        }
    } catch (error) {
        console.error('Migration failed for projectstask:', error);
        throw error;
    }
};

// Version: 1.0.0 - Projects and tasks table for managing freelance projects
