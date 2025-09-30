import DB from './index.schema';

export const CMS = 'cms';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(CMS);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        await DB.schema.createTable(CMS, table => {
            table.increments('cms_id').primary();
            table.text('image').nullable();       // "img1.jpg,img2.jpg"
            table.text('carousel').nullable();    // "slide1.jpg,slide2.jpg"

            table.string('title').notNullable();
            table.text('description').nullable();

            table.string('link_1').nullable();
            table.string('link_2').nullable();
            table.string('link_3').nullable();

            table.text('category', 'jsonb').nullable(); 
            table.text('faq', 'jsonb').nullable();
            table.text('blog', 'jsonb').nullable();

            table.string('type').nullable();

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
          ON ${CMS}
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
//    //createProcedure();
//     seed();
// };
// run();

