// To migrate this schema: npm run migrate:schema -- permission [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- permission
//    - Creates/updates the permission table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- permission --drop
//    - Completely drops and recreates the permission table from scratch
//
import DB from './index.schema';

export const PERMISSION = 'permission';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(PERMISSION);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');

        await DB.schema.createTable(PERMISSION, table => {
            table.increments('permission_id').primary();
            table.string('name', 100).unique().notNullable();
            table.string('label', 100);
            table.string('module', 50);
            table.text('description');
            table.boolean('is_critical').defaultTo(false);
            table.timestamp('created_at').defaultTo(DB.fn.now());
            table.timestamp('updated_at').defaultTo(DB.fn.now());
            table.integer('updated_by').nullable();
        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${PERMISSION}
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

// Version: 1.0.0 - Permissions table for granular access control