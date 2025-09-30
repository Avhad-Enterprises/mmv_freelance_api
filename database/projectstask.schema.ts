import DB from './index.schema';

export const PROJECTS_TASK = 'projects_task';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(PROJECTS_TASK);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(PROJECTS_TASK, table => {
            table.increments('projects_task_id').primary();  //ID
            table.integer('client_id').notNullable();
            table.integer('editor_id').nullable();
            table.string('project_title').notNullable();
            table.text('project_category').notNullable();
            table.date('deadline').notNullable();
            table.integer("status").notNullable().defaultTo(0);   // 0: pending, 1: assigned, 2: completed
            table.text('project_description').notNullable();
            table.integer('budget').notNullable();
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
            table.boolean('show_all_files').defaultTo(false);
            table.string('url').notNullable();
            table.string('meta_title').notNullable();
            table.text('meta_description').notNullable();
            table.integer('is_active').defaultTo(0);
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
          ON ${PROJECTS_TASK}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log('Finished Creating Triggers');
    } catch (error) {
        console.log(error);
    }
};


//    exports.seed = seed;
//    const run = async () => {
//       //createProcedure();
//        seed();
//    };
//    run();
