import DB from './index.schema';

export const SAVED_PROJECTS = 'saved_projects';

export const seed = async (dropFirst = false) => {

    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(SAVED_PROJECTS);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');

        await DB.schema.createTable(SAVED_PROJECTS, table => {
            table.increments('saved_projects_id').primary();
            table.integer("projects_task_id").notNullable();
            table.integer("user_id").notNullable();
            table.boolean("is_active").defaultTo(true);
            table.integer("created_by").nullable();
            table.timestamp('created_at').defaultTo(DB.fn.now())
            table.integer("updated_by").nullable();
            table.timestamp("updated_at").defaultTo(DB.fn.now());
            table.boolean("is_deleted").defaultTo(false);
            table.integer("deleted_by").nullable();
            table.timestamp("deleted_at").nullable();
        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');

        await DB.raw(`
          CREATE OR REPLACE FUNCTION update_timestamp()
          RETURNS TRIGGER AS $$
          BEGIN
              NEW.updated_at = CURRENT_TIMESTAMP;
              RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
        `);

        await DB.raw(`
          DROP TRIGGER IF EXISTS update_timestamp ON ${SAVED_PROJECTS};
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${SAVED_PROJECTS}
          FOR EACH ROW
          EXECUTE FUNCTION update_timestamp();
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