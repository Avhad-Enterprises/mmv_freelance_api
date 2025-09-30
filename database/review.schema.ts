import DB from './index.schema';

export const REVIEWS_TABLE = 'reviews';

export const seed = async (dropFirst = false) => {
  try {
    if (dropFirst) {
      console.log('Dropping Reviews Table');
      await DB.schema.dropTableIfExists(REVIEWS_TABLE);
      console.log('Dropped Reviews Table');
    }

    console.log('Seeding Reviews Table');

    await DB.schema.createTable(REVIEWS_TABLE, table => {
      table.increments('id').primary(); // Review ID
      table.integer('project_id').notNullable();
      table.integer('client_id').notNullable(); // Reviewer
      table.integer('user_id').notNullable(); // Freelancer receiving review

      table.integer('rating').notNullable(); // 1–5 stars
      table.text('review').notNullable();    // Actual review text

     
      table.boolean('is_deleted').defaultTo(false);
      table.timestamp('deleted_at').nullable();
      table.timestamp('created_at').defaultTo(DB.fn.now());
      table.timestamp('updated_at').defaultTo(DB.fn.now());
    });

    console.log('Creating Triggers');

    // Timestamp auto-update on edit
    await DB.raw(`
      CREATE TRIGGER update_timestamp
      BEFORE UPDATE
      ON ${REVIEWS_TABLE}
      FOR EACH ROW
      EXECUTE PROCEDURE update_timestamp();
    `);

    console.log('Finished Seeding Reviews Table');

  } catch (error) {
    console.error(error);
  }
};
  // exports.seed = seed;
  // const run = async () => {
  //    //createProcedure();
  //     seed(true);
  // };
  // run();