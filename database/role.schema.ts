import DB from './index.schema';

export const ROLE = 'role';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(ROLE);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        await DB.schema.createTable(ROLE, table => {
            table.increments('role_id').primary();
            table.string('name', 50).unique().notNullable();
            table.string('label', 100);
            table.text('description');
            table.boolean('is_active').defaultTo(true);
            table.timestamp('created_at').defaultTo(DB.fn.now());
            table.timestamp('updated_at').defaultTo(DB.fn.now());
        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${ROLE}
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
//      //createProcedure();
//       seed();
//   };
//   run();

