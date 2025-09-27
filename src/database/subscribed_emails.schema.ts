import DB from './index.schema';

export const SUBSCRIBED_EMAILS = 'subscribed_emails';

export const seed = async (dropFirst = false) => {

    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(SUBSCRIBED_EMAILS);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(SUBSCRIBED_EMAILS, table => {
            table.increments('id').primary();  //ID
            table.string ('email').unique();
            table.timestamp('subscribed_at').defaultTo(DB.fn.now());
            table.integer('is_active').defaultTo(0);


        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${SUBSCRIBED_EMAILS}
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
