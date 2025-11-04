// To migrate this schema: npm run migrate:schema -- freelancer_profiles [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- freelancer_profiles
//    - Creates/updates the freelancer_profiles table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- freelancer_profiles --drop
//    - Completely drops and recreates the freelancer_profiles table from scratch
//
// Version: 1.0.0 - Initial freelancer profiles schema
// - Contains common fields for both videographers and video editors
// - Links to users table via user_id foreign key
// - Cascades delete when user is deleted
//
import DB from './index';

export const FREELANCER_PROFILES = 'freelancer_profiles';

/**
 * Freelancer Profiles Schema
 * Contains common fields for both videographers and video editors
 */
export const migrate = async (dropFirst = false) => {
  try {
    if (dropFirst) {
      console.log('Dropping Freelancer Profiles Table with CASCADE');
      // Use raw SQL to handle CASCADE for dependent tables
      await DB.raw('DROP TABLE IF EXISTS freelancer_profiles CASCADE');
      console.log('Dropped Freelancer Profiles Table');
    }

    // Check if table already exists
    const tableExists = await DB.schema.hasTable(FREELANCER_PROFILES);
    
    if (!tableExists) {
      console.log('Creating Freelancer Profiles Table');
      await DB.schema.createTable(FREELANCER_PROFILES, (table) => {
        // Primary Key
        table.increments('freelancer_id').primary();
        
        // Foreign Key to users table
        table.integer('user_id')
          .unsigned()
          .notNullable()
          .unique()
          .references('user_id')
          .inTable('users')
          .onDelete('CASCADE');

        // Professional Info
        table.string('profile_title', 255).notNullable();
        table.string('role', 100).nullable().comment('Professional role/title');
        table.text('short_description').nullable();
        table.string('experience_level', 50).nullable().comment('entry, intermediate, expert, master');

        // Skills & Expertise (JSONB fields)
        table.jsonb('skills').defaultTo('[]').comment('Array of skill names');
        table.jsonb('superpowers').defaultTo('[]').comment('Unique selling points');
        table.jsonb('skill_tags').defaultTo('[]').comment('Skill categories/tags');
        table.jsonb('base_skills').defaultTo('[]').comment('Core/foundational skills');
        table.jsonb('languages').defaultTo('[]').comment('Languages spoken');

        // Portfolio & Credentials
        table.jsonb('portfolio_links').defaultTo('[]').comment('Array of portfolio URLs');
        table.jsonb('certification').nullable().comment('Certifications');
        table.jsonb('education').nullable().comment('Education background');
        table.jsonb('previous_works').nullable().comment('Previous work samples');
        table.jsonb('services').nullable().comment('Services offered');

        // Pricing & Availability
        table.decimal('rate_amount', 12, 2).nullable();
        table.string('currency', 3).defaultTo('INR').comment('Currency code: INR, USD, EUR');
        table.string('availability', 50).nullable().comment('part-time, full-time, flexible, on-demand');
        table.string('work_type', 50).nullable().comment('remote, on_site, hybrid');
        table.string('hours_per_week', 50).nullable().comment('less_than_20, 20_30, 30_40, more_than_40');

        // Verification
        table.string('id_type', 50).nullable().comment('passport, driving_license, national_id, aadhaar');
        table.text('id_document_url').nullable();
        table.boolean('kyc_verified').defaultTo(false);
        table.boolean('aadhaar_verification').defaultTo(false);

        // Stats & Performance
        table.integer('hire_count').defaultTo(0);
        table.integer('review_id').defaultTo(0);
        table.integer('total_earnings').defaultTo(0);
        table.integer('time_spent').defaultTo(0);

        // Credits System
        table.integer('credits_balance').defaultTo(0);
        table.integer('total_credits_purchased').defaultTo(0);
        table.integer('credits_used').defaultTo(0);

        // Projects
        table.jsonb('projects_applied').defaultTo('[]');
        table.jsonb('projects_completed').defaultTo('[]');

        // Payment
        table.jsonb('payment_method').nullable();
        table.jsonb('bank_account_info').nullable();

        // Timestamps
        table.timestamp('created_at').defaultTo(DB.fn.now());
        table.timestamp('updated_at').defaultTo(DB.fn.now());
      });
      console.log('Created Freelancer Profiles Table');
      
      console.log('Creating Triggers for Freelancer Profiles Table');
      await DB.raw(`
        CREATE TRIGGER update_timestamp
        BEFORE UPDATE
        ON ${FREELANCER_PROFILES}
        FOR EACH ROW
        EXECUTE PROCEDURE update_timestamp();
      `);
      console.log('Finished Creating Triggers');
    } else {
      console.log('Freelancer Profiles Table already exists');
    }
  } catch (error) {
    console.error('Migration failed for freelancer_profiles:', error);
    throw error;
  }
};
