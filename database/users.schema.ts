// To migrate this schema: npm run migrate:schema -- users [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- users
//    - Creates/updates the users table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- users --drop
//    - Completely drops and recreates the users table from scratch
//
// Version: 2.0.0 - Architecture Refactor: Cleaned base users table
// - Removed all type-specific fields (moved to profile tables)
// - Removed legacy fields (full_name, otp_code, account_status, tags, notes, updated_by, role, account_type)
// - Profile-specific data now in: freelancer_profiles, client_profiles, admin_profiles
//
import DB from './index.schema';

export const USERS_TABLE = 'users';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Users Table');
            await DB.raw('DROP TABLE IF EXISTS users CASCADE');
            console.log('Dropped Users Table');
        }
        console.log('Creating Users Table');
        await DB.schema.createTable(USERS_TABLE, table => {
            // Identity
            table.increments('user_id').primary();
            table.string('first_name', 255).notNullable();
            table.string('last_name', 255).notNullable();
            table.string('username', 255).unique().notNullable();
            table.string('email', 255).unique().notNullable();
            table.string('password', 255).nullable();
            
            // Contact
            table.string('phone_number', 50).nullable();
            table.boolean('phone_verified').defaultTo(false);
            table.boolean('email_verified').defaultTo(false);
            
            // Profile
            table.text('profile_picture').nullable();
            table.text('bio').nullable();
            table.string('timezone', 50).nullable();
            
            // Address (shared by all user types)
            table.string('address_line_first', 255).nullable();
            table.string('address_line_second', 255).nullable();
            table.string('city', 100).nullable();
            table.string('state', 100).nullable();
            table.string('country', 100).nullable();
            table.string('pincode', 20).nullable();
            table.decimal('latitude', 10, 8).nullable();
            table.decimal('longitude', 11, 8).nullable();
            
            // Account Management
            table.boolean('is_active').defaultTo(true);
            table.boolean('is_banned').defaultTo(false);
            table.boolean('is_deleted').defaultTo(false);
            table.text('banned_reason').nullable();
            
            // Security
            table.text('reset_token').nullable();
            table.timestamp('reset_token_expires').nullable();
            table.integer('login_attempts').defaultTo(0);
            table.timestamp('last_login_at').nullable();
            
            // Notifications
            table.boolean('email_notifications').defaultTo(true);
            
            // Timestamps
            table.timestamp('created_at').defaultTo(DB.fn.now());
            table.timestamp('updated_at').defaultTo(DB.fn.now());
        });

        console.log('Finished Creating Users Table');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${USERS_TABLE}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log('Finished Creating Triggers');
    } catch (error) {
        console.log(error);
    }
};

// Migration function for schema-based migrations
export const migrate = async () => {
    const tableExists = await DB.schema.hasTable(USERS_TABLE);
    if (!tableExists) {
        console.log('Users table does not exist, creating...');
        await seed(false); // Create without dropping
    } else {
        console.log('Users table already exists, skipping migration');
    }
};