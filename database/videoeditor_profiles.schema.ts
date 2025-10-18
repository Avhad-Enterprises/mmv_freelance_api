// To migrate this schema: npm run migrate:schema -- videoeditor_profiles [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- videoeditor_profiles
//    - Creates/updates the videoeditor_profiles table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- videoeditor_profiles --drop
//    - Completely drops and recreates the videoeditor_profiles table from scratch
//
// Version: 1.0.0 - Initial video editor profiles schema
// - Extends freelancer_profiles with video editor-specific fields
// - Links to freelancer_profiles table via freelancer_id foreign key
// - Prepared for future video editor-specific extensions
//
import DB from './index';

export const VIDEOEDITOR_PROFILES = 'videoeditor_profiles';

/**
 * Video Editor Profiles Schema
 * Contains video editor-specific fields
 * Currently prepared for future extensions
 */
export const migrate = async (dropFirst = false) => {
  if (dropFirst) {
    console.log('Dropping Video Editor Profiles Table');
    await DB.schema.dropTableIfExists(VIDEOEDITOR_PROFILES);
    console.log('Dropped Video Editor Profiles Table');
  }

  const tableExists = await DB.schema.hasTable(VIDEOEDITOR_PROFILES);
  if (!tableExists) {
    console.log('Video Editor Profiles table does not exist, creating...');
    console.log('Creating Video Editor Profiles Table');
    await DB.schema.createTable(VIDEOEDITOR_PROFILES, (table) => {
      // Primary Key
      table.increments('editor_id').primary();
      
      // Foreign Key to freelancer_profiles table
      table.integer('freelancer_id')
        .unsigned()
        .notNullable()
        .unique()
        .references('freelancer_id')
        .inTable('freelancer_profiles')
        .onDelete('CASCADE');

      // NOTE: Current schema has no video editor-specific fields
      // This table is prepared for future video editor-specific extensions
      // Examples of future fields:
      // - Specialized editing skills/niches
      // - Software proficiency levels (Premiere, Final Cut, DaVinci Resolve, etc.)
      // - Editing style preferences
      // - Color grading expertise
      // - Motion graphics capabilities

      // Timestamps
      table.timestamp('created_at').defaultTo(DB.fn.now());
      table.timestamp('updated_at').defaultTo(DB.fn.now());
    });
    console.log('Created Video Editor Profiles Table');
    
    console.log('Creating Triggers for Video Editor Profiles Table');
    await DB.raw(`
      CREATE TRIGGER update_timestamp
      BEFORE UPDATE
      ON ${VIDEOEDITOR_PROFILES}
      FOR EACH ROW
      EXECUTE PROCEDURE update_timestamp();
    `);
    console.log('Finished Creating Triggers');
  } else {
    console.log('Video Editor Profiles table already exists, skipping migration');
  }
};
