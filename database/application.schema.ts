import DB from './index.schema';

export const APPLICATION = 'application';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(APPLICATION);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        await DB.schema.createTable(APPLICATION, table => {
            table.increments('id').primary();
            table.integer('applied_to_job_id').notNullable();
            table.integer('applicant_id').notNullable();
            table.text('resume_url').nullable();
            table.text('cover_letter').nullable();
            table.decimal('expected_amount', 10, 2).nullable();
            table.boolean('is_hired').defaultTo(false);
            table.integer('is_active').defaultTo(0);
            table.integer('created_by').notNullable();
            table.timestamp('created_at').defaultTo(DB.fn.now());
            table.timestamp('updated_at').defaultTo(DB.fn.now());
            table.integer('updated_by').nullable();
            table.boolean('is_deleted').defaultTo(false);
            table.integer('deleted_by').nullable();
            table.timestamp('deleted_at').nullable();
        })


        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${APPLICATION}
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

