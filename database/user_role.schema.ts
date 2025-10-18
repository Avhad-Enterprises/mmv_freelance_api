// To migrate this schema: npm run migrate:schema -- user_role [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- user_role
//    - Creates/updates the user_roles table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- user_role --drop
//    - Completely drops and recreates the user_roles table from scratch
//
import DB from './index';

export const USER_ROLES = 'user_roles';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTableIfExists(USER_ROLES);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        
        // Check if table exists
        const tableExists = await DB.schema.hasTable(USER_ROLES);
        
        if (!tableExists) {
            await DB.schema.createTable(USER_ROLES, table => {
                table.increments('id').primary(); 
                table.integer('user_id').notNullable().references('user_id').inTable('users').onDelete('CASCADE');
                table.integer('role_id').notNullable().references('role_id').inTable('role').onDelete('CASCADE');
                table.timestamp('created_at').defaultTo(DB.fn.now());
                table.timestamp('updated_at').defaultTo(DB.fn.now());
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
        } else {
            console.log('Table already exists, skipping creation');
        }
    } catch (error) {
        console.error('Migration failed for user_role:', error);
        throw error;
    }
};

// Migration function for schema-based migrations
export const migrate = async (dropFirst = false) => {
    // For schema-based migrations, check if table exists first
    if (dropFirst) {
        await seed(true); // Drop and recreate
    } else {
        await seed(false); // Only create if doesn't exist
    }
};

// Version: 1.0.0 - User roles junction table for many-to-many relationships

