import DB from './index.schema';

export const SEO = 'SEO';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(SEO);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        await DB.schema.createTable(SEO, table => {
            table.increments('id').primary();
            table.string('meta_title').notNullable();
            table.string('meta_description').notNullable();
            table.string('canonical_url').nullable();
            table.string('og_title').nullable();
            table.string('og_description').nullable();
            table.string('og_image_url').nullable();
            table.string('og_site_name').nullable();
            table.string('og_locale').nullable();
            table.string('twitter_card').nullable(); // fixed casing from twitter_Card
            table.string('twitter_title').nullable();
            table.string('twitter_image_url').nullable();
            table.string('twitter_description').nullable();
            table.string('twitter_site').nullable();
            table.string('twitter_creator').nullable();
            table.string('status').nullable();
            table.boolean('is_active').defaultTo(true);
            table.boolean('is_deleted').defaultTo(false);
            table.timestamp('created_at').defaultTo(DB.fn.now());
            table.timestamp('updated_at').defaultTo(DB.fn.now());
        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${SEO}
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
//     //createProcedure();
//      seed();
//  };
//  run();

