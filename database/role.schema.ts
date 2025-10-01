// To migrate this schema: npm run migrate:schema -- role [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- role
//    - Creates/updates the role table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- role --drop
//    - Completely drops and recreates the role table from scratch
//
import DB from './index.schema';

export const ROLE = 'role';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(ROLE);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        await DB.schema.createTable(ROLE, table => {
            table.increments('role_id').primary();
            table.string('name', 50).unique().notNullable();
            table.string('label', 100);
            table.text('description');
            table.boolean('is_active').defaultTo(true);
            table.timestamp('created_at').defaultTo(DB.fn.now());
            table.timestamp('updated_at').defaultTo(DB.fn.now());
        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${ROLE}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
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

// Version: 1.0.0 - User roles table for access control

