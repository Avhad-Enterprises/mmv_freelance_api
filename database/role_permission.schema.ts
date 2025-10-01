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
            await DB.schema.dropTableIfExists(ROLE_PERMISSION);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        
        // Check if table exists
        const tableExists = await DB.schema.hasTable(ROLE_PERMISSION);
        
        if (!tableExists) {
            await DB.schema.createTable(ROLE_PERMISSION, table => {
                table.integer('role_id').notNullable();  
                table.integer('permission_id').notNullable();  
                table.primary(['role_id', 'permission_id']); // Composite primary key
                table.foreign('role_id').references('role.role_id').onDelete('CASCADE'); 
                table.foreign('permission_id').references('permission.permission_id').onDelete('CASCADE');
                table.timestamp('created_at').defaultTo(DB.fn.now());
                table.timestamp('updated_at').defaultTo(DB.fn.now());
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
        } else {
            console.log('Table already exists, skipping creation');
        }
    } catch (error) {
        console.log(error);
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

// Version: 1.0.0 - Role permissions junction table for access control

