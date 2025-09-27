import DB from './index.schema';

export const SUBMITTED_PROJECTS = 'submitted_projects';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(SUBMITTED_PROJECTS);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        
        await DB.schema.createTable(SUBMITTED_PROJECTS, table => {
            table.increments('submission_id').primary();
            table.integer('projects_task_id').notNullable();
            table.integer('user_id').notNullable();
            table.string('submitted_files').notNullable();
            table.text('additional_notes');
            table.integer("status").notNullable().defaultTo(0); // 0: Submitted, 1: Under Review, 2: Approved, 3: Rejected

            // compulsory columns
            table.boolean('is_active').defaultTo(true);
            table.boolean('is_deleted').defaultTo(false);
            table.integer('deleted_by').nullable();
            table.timestamp('deleted_at').nullable();
            table.integer('created_by').nullable();
            table.integer('updated_by').nullable();
            table.timestamp('created_at').defaultTo(DB.fn.now());
            table.timestamp('updated_at').defaultTo(DB.fn.now());
        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        
        await DB.raw(`
          CREATE OR REPLACE FUNCTION update_timestamp_submitted_projects()
          RETURNS TRIGGER AS $$
          BEGIN
              NEW.updated_at = CURRENT_TIMESTAMP;
              RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
        `);

        await DB.raw(`
          DROP TRIGGER IF EXISTS update_timestamp ON ${SUBMITTED_PROJECTS};
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${SUBMITTED_PROJECTS}
          FOR EACH ROW
          EXECUTE FUNCTION update_timestamp_submitted_projects();
        `);
        
        console.log('Finished Creating Triggers');
    } catch (error) {
        console.log(error);
    }
};

//   exports.seed = seed;
//   const run = async () => {
//      //createProcedure();
//       seed();
//   };
//   run();
//comment this out ...............