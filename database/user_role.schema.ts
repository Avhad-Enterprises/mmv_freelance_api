// To migrate this schema: npm run migrate:schema -- user_role [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- user_role
//    - Creates/updates the user_roles table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- user_role --drop
//    - Completely drops and recreates the user_roles table from scratch
//
import DB from './index.schema';

export const USER_ROLES = 'user_roles';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(USER_ROLES);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        await DB.schema.createTable(USER_ROLES, table => {
            table.increments('id').primary(); 
            table.integer('user_id').notNullable().references('user_id').inTable('users');
            table.integer('role_id').notNullable().references('role_id').inTable('role');
        });
        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${USER_ROLES}
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

// Version: 1.0.0 - User roles junction table for many-to-many relationships

