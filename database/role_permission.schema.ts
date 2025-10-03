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

// ========== ROLE-PERMISSION MAPPINGS ==========
const rolePermissionMappings = {
  CLIENT: [
    // Profile management
    'profile.view',
    'profile.update',
    
    // Project management
    'projects.view',
    'projects.create',
    'projects.update',
    'projects.delete', // Own projects only
    'projects.hire',
    'projects.manage', // Own projects only
    
    // Reviews
    'reviews.view',
    'reviews.create',
    
    // Payments
    'payments.view', // Own payments only
    
    // Support
    'support.view',
    'support.create',
  ],
  
  VIDEOGRAPHER: [
    // Profile management
    'profile.view',
    'profile.update',
    
    // Project management
    'projects.view',
    'projects.apply',
    'projects.update', // Applied projects only
    
    // Reviews
    'reviews.view',
    'reviews.create',
    
    // Payments
    'payments.view', // Own payments only
    
    // Support
    'support.view',
    'support.create',
  ],
  
  VIDEO_EDITOR: [
    // Profile management
    'profile.view',
    'profile.update',
    
    // Project management
    'projects.view',
    'projects.apply',
    'projects.update', // Applied projects only
    
    // Reviews
    'reviews.view',
    'reviews.create',
    
    // Payments
    'payments.view', // Own payments only
    
    // Support
    'support.view',
    'support.create',
  ],
  
  ADMIN: [
    // All basic permissions
    'profile.view',
    'profile.update',
    'profile.verify',
    
    // User management
    'users.view',
    'users.update',
    'users.ban',
    
    // Project management
    'projects.view',
    'projects.update',
    'projects.delete',
    'projects.manage',
    
    // Content management
    'content.view',
    'content.create',
    'content.update',
    'content.delete',
    'content.publish',
    
    // Reviews
    'reviews.view',
    'reviews.moderate',
    'reviews.delete',
    
    // Payments
    'payments.view',
    
    // Reports
    'reports.view',
    'reports.create',
    'reports.export',
    
    // Support
    'support.view',
    'support.create',
    'support.respond',
    'support.resolve',
    
    // Admin functions
    'admin.dashboard',
    'admin.analytics',
  ],
  
  SUPER_ADMIN: [
    // All permissions - will be assigned programmatically
    '*',
  ],
};

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

            console.log('Inserting role-permission mappings...');
            
            // Get all roles and permissions
            const roles = await DB('role').select('*');
            const permissions = await DB('permission').select('*');

            let insertedCount = 0;

            for (const role of roles) {
              const rolePermissionNames = rolePermissionMappings[role.name as keyof typeof rolePermissionMappings];

              if (!rolePermissionNames) {
                continue;
              }

              // Special case: SUPER_ADMIN gets all permissions
              let permissionsToAssign: any[];
              if (rolePermissionNames.includes('*')) {
                permissionsToAssign = permissions;
              } else {
                permissionsToAssign = permissions.filter(p => 
                  rolePermissionNames.includes(p.name)
                );
              }

              // Insert mappings that don't already exist
              for (const permission of permissionsToAssign) {
                const exists = await DB(ROLE_PERMISSION)
                  .where({ role_id: role.role_id, permission_id: permission.permission_id })
                  .first();

                if (!exists) {
                  await DB(ROLE_PERMISSION).insert({
                    role_id: role.role_id,
                    permission_id: permission.permission_id,
                  });
                  insertedCount++;
                }
              }
            }

            console.log(`Inserted ${insertedCount} role-permission mappings`);

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

