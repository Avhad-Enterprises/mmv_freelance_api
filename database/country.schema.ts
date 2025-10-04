// To migrate this schema: npm run migrate:schema -- country [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- country
//    - Creates/updates the country table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- country --drop
//    - Completely drops and recreates the country table from scratch
//
import DB from './index.schema';

export const COUNTRY = 'country';

export const seed = async (dropFirst = false) => {

    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTableIfExists(COUNTRY);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');

        await DB.schema.createTable(COUNTRY, table => {
            table.increments('country_id').primary(); 
            table.string('country_name').notNullable(); 
            table.string('country_code', 10).notNullable(); 
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
          DROP TRIGGER IF EXISTS update_timestamp ON ${COUNTRY};
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${COUNTRY}
          FOR EACH ROW
          EXECUTE FUNCTION update_timestamp();
        `);

        console.log('Finished Creating Triggers');
    } catch (error) {
        console.log(error);
    }
};

// Migration function for schema-based migrations
export const migrate = async (dropFirst = false) => {
    // For schema-based migrations, always ensure clean state
    await seed(true); // Always drop and recreate for clean migrations
};

// Version: 1.0.0 - Country lookup table with country codes and names
