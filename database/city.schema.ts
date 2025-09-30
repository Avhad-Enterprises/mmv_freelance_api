import DB from './index.schema';
export const CITIES = 'cities';
export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(CITIES);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        await DB.schema.createTable(CITIES, table => {
            table.increments('city_id').primary(); 
            table.integer('state_id').notNullable(); 
            table.string('state_code', 10).notNullable(); 
            table.string('state_name').notNullable(); 
            table.string('city_name').notNullable(); 
            table.timestamp('created_at').defaultTo(DB.fn.now()); 
            table.timestamp('updated_at').defaultTo(DB.fn.now()); 
        });
        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE OR REPLACE FUNCTION update_timestamp()
          RETURNS TRIGGER AS $$
          BEGIN
              NEW.updated_at = CURRENT_TIMESTAMP;
              RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
        `);
        await DB.raw(`
          DROP TRIGGER IF EXISTS update_timestamp ON ${CITIES};
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${CITIES}
          FOR EACH ROW
          EXECUTE FUNCTION update_timestamp();
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
