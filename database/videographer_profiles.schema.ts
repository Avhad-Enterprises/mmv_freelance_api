// To migrate this schema: npm run migrate:schema -- videographer_profiles [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- videographer_profiles
//    - Creates/updates the videographer_profiles table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- videographer_profiles --drop
//    - Completely drops and recreates the videographer_profiles table from scratch
//
// Version: 1.0.0 - Initial videographer profiles schema
// - Extends freelancer_profiles with videographer-specific fields
// - Links to freelancer_profiles table via freelancer_id foreign key
// - Prepared for future videographer-specific extensions
//
import DB from './index';

export const VIDEOGRAPHER_PROFILES = 'videographer_profiles';

/**
 * Videographer Profiles Schema
 * Contains videographer-specific fields
 * Currently prepared for future extensions
 */
export const migrate = async (dropFirst = false) => {
  if (dropFirst) {
    console.log('Dropping Videographer Profiles Table');
    await DB.schema.dropTableIfExists(VIDEOGRAPHER_PROFILES);
    console.log('Dropped Videographer Profiles Table');
  }

  const tableExists = await DB.schema.hasTable(VIDEOGRAPHER_PROFILES);
  if (!tableExists) {
    console.log('Videographer Profiles table does not exist, creating...');
    console.log('Creating Videographer Profiles Table');
    await DB.schema.createTable(VIDEOGRAPHER_PROFILES, (table) => {
      // Primary Key
      table.increments('videographer_id').primary();
      
      // Foreign Key to freelancer_profiles table
      table.integer('freelancer_id')
        .unsigned()
        .notNullable()
        .unique()
        .references('freelancer_id')
        .inTable('freelancer_profiles')
        .onDelete('CASCADE');

      // NOTE: Current schema has no videographer-specific fields
      // This table is prepared for future videographer-specific extensions
      // Examples of future fields:
      // - Specialized videography skills/niches
      // - Equipment preferences (if tracking becomes needed)
      // - Shooting style preferences
      // - Drone operation certification
      // - Camera equipment owned

      // Timestamps
      table.timestamp('created_at').defaultTo(DB.fn.now());
      table.timestamp('updated_at').defaultTo(DB.fn.now());
    });
    console.log('Created Videographer Profiles Table');
    
    console.log('Creating Triggers for Videographer Profiles Table');
    await DB.raw(`
      CREATE TRIGGER update_timestamp
      BEFORE UPDATE
      ON ${VIDEOGRAPHER_PROFILES}
      FOR EACH ROW
      EXECUTE PROCEDURE update_timestamp();
    `);
    console.log('Finished Creating Triggers');
  } else {
    console.log('Videographer Profiles table already exists, skipping migration');
  }
};