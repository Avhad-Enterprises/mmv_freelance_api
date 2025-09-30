import DB from './index.schema';

export const FAQ = 'faq';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(FAQ);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        await DB.schema.createTable(FAQ, table => {
            table.increments('faq_id').primary();
            table.string('type', 50).defaultTo('general');   
            table.text('question').notNullable(); 
            table.text('answer').notNullable(); 
             
            table.boolean("is_active").defaultTo(true);
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
          ON ${FAQ}
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
