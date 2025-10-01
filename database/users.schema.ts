// To migrate this schema: npm run migrate:schema -- users [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- users
//    - Creates/updates the users table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- users --drop
//    - Completely drops and recreates the users table from scratch
//
import DB from './index.schema';

export const USERS_TABLE = 'users';

export const seed = async (dropFirst = false) => {

    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTableIfExists(USERS_TABLE);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(USERS_TABLE, table => {
            table.increments('user_id').primary(); // ID
            table.string("first_name").notNullable();
            table.string("last_name").notNullable();
            table.string("full_name").nullable(); // Legacy field, now nullable
            table.string('username').notNullable();
            table.string('phone_number').nullable(); // Made nullable in migration 003
            table.string('email').unique();
            table.string('password').nullable();
            table.string('profile_picture').nullable();
            
            // Address fields (added in migration 001)
            table.string('address_line_first').nullable();
            table.string('address_line_second').nullable();
            table.string('city').nullable();
            table.string('state').nullable();
            table.string('country').nullable();
            table.string('pincode').nullable();
            table.boolean('phone_verified').defaultTo(false);
            
            // Freelancer-specific fields
            table.string("profile_title").nullable(); // Made nullable in migration 003
            table.jsonb('skills').nullable(); // Array of skill names (added in migration 001)
            table.enu("experience_level", ["entry", "intermediate", "expert", "master"]).nullable(); // Updated enums and made nullable
            table.string("portfolio_links").nullable(); // Single URL
            table.decimal("hourly_rate", 10, 2).nullable();
            table.enu("availability", ["full_time", "part_time", "flexible", "on_demand"]).nullable(); // Updated enums
            table.enu("work_type", ["remote", "on_site", "hybrid"]).nullable(); // Updated enums
            table.enu("hours_per_week", ["less_than_20", "20_30", "30_40", "more_than_40"]).nullable(); // Added in migration 001
            table.jsonb('languages').defaultTo(DB.raw(`'[]'`)); // Array of languages (added in migration 001)
            table.enu("id_type", ["passport", "driving_license", "national_id"]).nullable(); // Updated enums
            table.string("id_document_url").nullable();
            
            // Client-specific fields
            table.string("company_name").nullable(); // Made nullable in migration 003
            table.enu('industry', ["film", "ad_agency", "events", "youtube", "corporate", "other"]).nullable(); // Updated enums
            table.string('website').nullable(); // Single website URL (added in migration 001)
            table.string('social_links').nullable(); // Social media links (added in migration 001)
            table.enu("company_size", ["1-10", "11-50", "51-200", "200+"]).nullable();
            table.jsonb("required_services").nullable(); // Array of required services (added in migration 001)
            table.jsonb("required_skills").nullable(); // Array of required skills (added in migration 001)
            table.jsonb("required_editor_proficiencies").nullable(); // Array of editor proficiencies (added in migration 001)
            table.jsonb("required_videographer_proficiencies").nullable(); // Array of videographer proficiencies (added in migration 001)
            table.decimal("budget_min", 12, 2).nullable(); // Added in migration 001
            table.decimal("budget_max", 12, 2).nullable(); // Added in migration 001
            table.string("address").nullable(); // Business address for clients (added in migration 001)
            table.string("tax_id").nullable(); // Added in migration 001
            table.jsonb("business_documents").nullable(); // Array of document URLs (added in migration 001)
            table.enu("work_arrangement", ["remote", "on_site", "hybrid"]).nullable(); // Added in migration 001
            table.enu("project_frequency", ["one_time", "occasional", "ongoing"]).nullable(); // Added in migration 001
            table.enu("hiring_preferences", ["individuals", "agencies", "both"]).nullable(); // Added in migration 001
            table.string("expected_start_date").nullable(); // Added in migration 001
            table.enu("project_duration", ["less_than_week", "1_2_weeks", "2_4_weeks", "1_3_months", "3_plus_months"]).nullable(); // Added in migration 001

            table.string("otp_code").nullable(); // temp storage during verification
            table.decimal('latitude', 10, 8).nullable();
            table.decimal('longitude', 11, 8).nullable();
            table.boolean('aadhaar_verification').defaultTo(false);
            table.boolean('email_verified').defaultTo(false);
            table.text('reset_token').nullable();
            table.timestamp('reset_token_expires').nullable();
            table.string('login_attempts').defaultTo(0);
            table.boolean('kyc_verified').defaultTo(false);
            table.string('role').nullable();
            table.text('banned_reason').nullable();
            table.text('bio').nullable();
            table.string('timezone').nullable();
            table.boolean('email_notifications').nullable();
            table.jsonb('tags').defaultTo(DB.raw(`'[]'`));
            table.jsonb('notes').nullable();
            table.jsonb('certification').nullable();
            table.jsonb('education').nullable();
            table.jsonb('services').nullable();
            table.jsonb('previous_works').nullable();
            table.jsonb('projects_created').defaultTo(DB.raw(`'[]'`));
            table.jsonb('projects_applied').defaultTo(DB.raw(`'[]'`));
            table.jsonb('projects_completed').defaultTo(DB.raw(`'[]'`));
            table.integer('hire_count').defaultTo(0);
            table.integer('review_id').defaultTo(0);
            table.integer('total_earnings').defaultTo(0);
            table.integer('total_spent').defaultTo(0);
            table.jsonb('payment_method').nullable();
            table.jsonb('payout_method').nullable();
            table.jsonb('bank_account_info').nullable();
            table.string('account_type').nullable(); // (freelancer, client)
            table.integer('time_spent').defaultTo(0);
            table.string('account_status').defaultTo('Active'); // (Active, Inactive, Banned)
            table.boolean('is_active').defaultTo(true); // is_active is used to check if the user is active or not
            table.boolean('is_banned').defaultTo(false); // is_banned is used to check if the user is banned or not
            table.boolean("is_deleted").defaultTo(false);
            table.timestamp("created_at").defaultTo(DB.fn.now());
            table.timestamp("updated_at").defaultTo(DB.fn.now());
            table.integer("updated_by").nullable();
            table.timestamp('last_login_at').nullable();


        });

        console.log('Finished Seeding Tables');
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
export const migrate = async (dropFirst = false) => {
    // For schema-based migrations, always ensure clean state
    await seed(true); // Always drop and recreate for clean migrations
};

// Version: 1.0.0 - Complete users table with Phase 2 registration fields