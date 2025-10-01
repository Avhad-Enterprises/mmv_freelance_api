// To migrate this schema: npm run migrate:schema -- admin_profiles [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- admin_profiles
//    - Creates/updates the admin_profiles table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- admin_profiles --drop
//    - Completely drops and recreates the admin_profiles table from scratch
//
// Version: 1.0.0 - Initial admin profiles schema
// - Contains admin-specific fields
// - Links to users table via user_id foreign key
// - Prepared for future admin-specific extensions
//
import DB from './index.schema';

export const ADMIN_PROFILES = 'admin_profiles';

/**
 * Admin Profiles Schema
 * Contains admin-specific fields
 * Currently prepared for future extensions
 */
export const migrate = async () => {
  console.log('Dropping Admin Profiles Table');
  await DB.schema.dropTableIfExists(ADMIN_PROFILES);
  console.log('Dropped Admin Profiles Table');

  console.log('Creating Admin Profiles Table');
  await DB.schema.createTable(ADMIN_PROFILES, (table) => {
    // Primary Key
    table.increments('admin_id').primary();
    
    // Foreign Key to users table
    table.integer('user_id')
      .unsigned()
      .notNullable()
      .unique()
      .references('user_id')
      .inTable('users')
      .onDelete('CASCADE');

    // NOTE: Current schema has no admin-specific fields beyond base user data
    // This table is prepared for future admin-specific extensions
    // Examples of future fields:
    // - Admin level/tier (super_admin, admin, moderator)
    // - Department/area of responsibility
    // - Special permissions overrides
    // - Admin activity logs reference
    // - Access restrictions

    // Timestamps
    table.timestamp('created_at').defaultTo(DB.fn.now());
    table.timestamp('updated_at').defaultTo(DB.fn.now());
  });
  console.log('Created Admin Profiles Table');
};

export const seed = async () => {
  console.log('Seeding Admin Profiles Table');
  // No default seed data needed
  console.log('Finished Seeding Admin Profiles Table');
};
