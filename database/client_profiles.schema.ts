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
import DB from './index.schema';

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
    table.string('industry', 50).nullable().comment('film, ad_agency, events, youtube, corporate, other');
    table.string('website', 255).nullable().comment('Company website URL');
    table.string('social_links', 255).nullable().comment('Social media links');
    table.string('company_size', 50).nullable().comment('1-10, 11-50, 51-200, 200+');

    // Requirements & Services
    table.jsonb('required_services').defaultTo('[]').comment('Array of required services');
    table.jsonb('required_skills').defaultTo('[]').comment('Array of required skills');
    table.jsonb('required_editor_proficiencies').defaultTo('[]').comment('Editor proficiency requirements');
    table.jsonb('required_videographer_proficiencies').defaultTo('[]').comment('Videographer proficiency requirements');

    // Budget
    table.decimal('budget_min', 12, 2).nullable();
    table.decimal('budget_max', 12, 2).nullable();

    // Business Details
    table.string('address', 255).nullable().comment('Business address');
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
  } else {
    console.log('Client Profiles Table already exists');
  }
};

export const seed = async () => {
  console.log('Seeding Client Profiles Table');
  // No default seed data needed
  console.log('Finished Seeding Client Profiles Table');
};
