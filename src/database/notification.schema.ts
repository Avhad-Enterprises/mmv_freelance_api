import DB from './index.schema';

export const NOTIFICATION = 'notification';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(NOTIFICATION);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(NOTIFICATION, table => {
           table.increments('id').primary();  //ID
           table.integer('user_id').notNullable();
           table.string('title').notNullable();
           table.text('message').notNullable();
           table.string('type').notNullable();
           table.integer('related_id').nullable();
           table.string('related_type').nullable();
           table.string('redirect_url').nullable();
           table.boolean('is_read').defaultTo(0);
           table.timestamp('read_at').nullable();
        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${NOTIFICATION}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log('Finished Creating Triggers');
    } catch (error) {
        console.log(error);
    }
};

    // exports.seed = seed;
    // const run = async () => {
    //  //createProcedure();
    //   seed();
    //  };
    // run();

