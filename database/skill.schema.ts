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

//   exports.seed = seed;
//   const run = async () => {
//       //createProcedure();
//       seed();
//   };
//   run();
