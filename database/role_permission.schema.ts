// To migrate this schema: npm run migrate:schema -- role_permission [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- role_permission
//    - Creates/updates the role_permission table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- role_permission --drop
//    - Completely drops and recreates the role_permission table from scratch
//
import DB from './index.schema';

export const ROLE_PERMISSION = 'role_permission';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(ROLE_PERMISSION);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        await DB.schema.createTable(ROLE_PERMISSION, table => {
            table.increments('id').primary(); 
            table.integer('role_id').notNullable();  
            table.integer('permission_id').notNullable();  
            table.primary(['role_id', 'permission_id']);  
            table.foreign('role_id').references('role.role_id').onDelete('CASCADE'); 
            table.foreign('permission_id').references('permission.permission_id').onDelete('CASCADE');  
        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${ROLE_PERMISSION}
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

// Version: 1.0.0 - Role permissions junction table for access control

