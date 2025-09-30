import DB from './index.schema';

export const CATEGORY = 'category';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(CATEGORY);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(CATEGORY, table => {
            table.increments('category_id').primary();  //ID
            table.string('name').notNullable(); //Video Edit
            table.string('value').notNullable(); //video-edit
            table.string('slug').notNullable();
            table.text("types", "jsonb").nullable(); //projects
            table.text("notes", "jsonb").nullable();
            table.boolean('is_active').defaultTo(true); 
            table.integer('created_by').notNullable(); //logged is user id
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
          ON ${CATEGORY}
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

