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

// ========== ROLE DEFINITIONS ==========
interface RoleData {
  name: string;
  label: string;
  description: string;
  is_active: boolean;
}

const predefinedRoles: RoleData[] = [
  {
    name: 'CLIENT',
    label: 'Client',
    description: 'Business or individual hiring freelancers',
    is_active: true,
  },
  {
    name: 'VIDEOGRAPHER',
    label: 'Videographer',
    description: 'Video shooting professional',
    is_active: true,
  },
  {
    name: 'VIDEO_EDITOR',
    label: 'Video Editor',
    description: 'Video editing professional',
    is_active: true,
  },
  {
    name: 'ADMIN',
    label: 'Administrator',
    description: 'Platform administrator with management access',
    is_active: true,
  },
  {
    name: 'SUPER_ADMIN',
    label: 'Super Administrator',
    description: 'Full platform access with all permissions',
    is_active: true,
  },
];

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.raw(`DROP TABLE IF EXISTS "${ROLE}" CASCADE`);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        
        // Check if table exists
        const tableExists = await DB.schema.hasTable(ROLE);
        
        if (!tableExists) {
            await DB.schema.createTable(ROLE, table => {
                table.increments('role_id').primary();
                table.string('name', 50).unique().notNullable();
                table.string('label', 100);
                table.text('description');
                table.boolean('is_active').defaultTo(true);
                table.timestamp('created_at').defaultTo(DB.fn.now());
                table.timestamp('updated_at').defaultTo(DB.fn.now());
            });

            console.log('Inserting role data...');
            await DB(ROLE).insert(predefinedRoles);
            console.log(`Inserted ${predefinedRoles.length} roles`);

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

// Version: 1.0.0 - User roles table for access control

