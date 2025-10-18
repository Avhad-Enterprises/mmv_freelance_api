// To migrate this schema: npm run migrate:schema -- client_profiles [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- client_profiles
//    - Creates/updates the client_profiles table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- client_profiles --drop
//    - Completely drops and recreates the client_profiles table from scratch
//
// Version: 1.0.0 - Initial client profiles schema
// - Contains client-specific fields for businesses hiring freelancers
// - Links to users table via user_id foreign key
// - Cascades delete when user is deleted
//
import DB from './index';

export const CLIENT_PROFILES = 'client_profiles';

/**
 * Client Profiles Schema
 * Contains client-specific fields for businesses hiring freelancers
 */
export const migrate = async (dropFirst = false) => {
  if (dropFirst) {
    console.log('Dropping Client Profiles Table');
    await DB.schema.dropTableIfExists(CLIENT_PROFILES);
    console.log('Dropped Client Profiles Table');
  }

  // Check if table already exists
  const tableExists = await DB.schema.hasTable(CLIENT_PROFILES);
  
  if (!tableExists) {
    console.log('Creating Client Profiles Table');
    await DB.schema.createTable(CLIENT_PROFILES, (table) => {
      // Primary Key
    table.increments('client_id').primary();
    
    // Foreign Key to users table
    table.integer('user_id')
      .unsigned()
      .notNullable()
      .unique()
      .references('user_id')
      .inTable('users')
      .onDelete('CASCADE');

        // Company Information
    table.string('company_name', 255).notNullable();
    table.string('website', 255).nullable().comment('Company website URL');
    table.text('company_description').nullable().comment('Company description');
    table.string('industry', 50).nullable().comment('film, ad_agency, events, youtube, corporate, other');
    table.string('social_links', 255).nullable().comment('Social media links');
    table.string('company_size', 50).nullable().comment('1-10, 11-50, 51-200, 200+');

    // Project Information
    table.string('project_title', 255).nullable().comment('Current project title');
    table.text('project_description').nullable().comment('Project description');
    table.string('project_category', 100).nullable().comment('Project category');
    table.decimal('project_budget', 12, 2).nullable().comment('Project budget');
    table.string('project_timeline', 100).nullable().comment('Project timeline');

    // Terms and Privacy
    table.boolean('terms_accepted').defaultTo(false).comment('Terms and conditions accepted');
    table.boolean('privacy_policy_accepted').defaultTo(false).comment('Privacy policy accepted');

    // Business Details
    table.string('tax_id', 100).nullable().comment('Tax identification number');
    table.jsonb('business_documents').nullable().comment('Array of business document URLs');
    table.text('id_document_url').nullable().comment('ID document upload URL');
    table.text('business_document_url').nullable().comment('Business document upload URL');

    // Work Preferences
    table.string('work_arrangement', 50).nullable().comment('remote, on_site, hybrid');
    table.string('project_frequency', 50).nullable().comment('one_time, occasional, ongoing');
    table.string('hiring_preferences', 50).nullable().comment('individuals, agencies, both');
    table.string('expected_start_date', 100).nullable().comment('Expected project start date');
    table.string('project_duration', 50).nullable().comment('less_than_week, 1_2_weeks, 2_4_weeks, 1_3_months, 3_plus_months');

    // Stats
    table.jsonb('projects_created').defaultTo('[]');
    table.integer('total_spent').defaultTo(0);

    // Payment
    table.jsonb('payment_method').nullable();

    // Timestamps
    table.timestamp('created_at').defaultTo(DB.fn.now());
    table.timestamp('updated_at').defaultTo(DB.fn.now());
  });
  console.log('Created Client Profiles Table');
  
  console.log('Creating Triggers for Client Profiles Table');
  await DB.raw(`
    CREATE TRIGGER update_timestamp
    BEFORE UPDATE
    ON ${CLIENT_PROFILES}
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp();
  `);
  console.log('Finished Creating Triggers');
  } else {
    console.log('Client Profiles Table already exists');
  }
};
