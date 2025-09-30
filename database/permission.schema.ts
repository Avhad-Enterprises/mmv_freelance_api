import DB from './index.schema';

export const PERMISSION = 'permission';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(PERMISSION);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');

        await DB.schema.createTable(PERMISSION, table => {
            table.increments('permission_id').primary();
            table.string('name', 100).unique().notNullable();
            table.string('label', 100);
            table.string('module', 50);
            table.text('description');
            table.boolean('is_critical').defaultTo(false);
            table.timestamp('created_at').defaultTo(DB.fn.now());
            table.timestamp('updated_at').defaultTo(DB.fn.now());
            table.integer('updated_by').nullable();
        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${PERMISSION}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log('Finished Creating Triggers');
    } catch (error) {
        console.log(error);
    }
};

    //  exports.seed = seed;
    //  const run = async () => {
    //  //createProcedure();
    //    seed();
    //  };
    //  run();

