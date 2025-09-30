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
        await DB.schema.createTable(USERS_TABLE, table => {
            table.increments('user_id').primary();
            table.string('full_name').nullable();
            table.string('username').notNullable();
            table.string('email').unique();
            table.string('phone_number').notNullable();
            table.string('profile_picture').nullable();
            // New fields added based on user request
            table.string('profile_title').nullable(); // Profile Title
            table.jsonb('category_of_services').defaultTo(DB.raw(`'[]'`)); // Category of Services
            table.string('experience_level').nullable(); // Experience Level (Beginner, Intermediate, Expert)
            table.jsonb('portfolio_links').nullable(); // Portfolio Upload/Links
            table.decimal('hourly_rate', 10, 2).nullable(); // Hourly Rate
            table.decimal('project_rate', 10, 2).nullable(); // Project Rate
            table.string('work_type').nullable(); // Work Type (Remote Only, On-Site, Hybrid)
            table.jsonb('languages_spoken').defaultTo(DB.raw(`'[]'`)); // Languages Spoken

            // Employer-specific fields
            table.string('company_name').nullable(); // Company/Brand Name
            table.string('industry').nullable(); // Industry (Film, Ad Agency, etc.)
            table.jsonb('website_links').nullable(); // Website/Social Links
            table.string('company_size').nullable(); // Company Size (1-10, 11-50, etc.)
            table.jsonb('services_required').defaultTo(DB.raw(`'[]'`)); // Type of Services Required
            table.string('average_project_budget').nullable(); // Average Project Budget Range
            table.string('project_frequency').nullable(); // Project Frequency (One-time, Occasional, Ongoing)
            table.string('hiring_preferences').nullable(); // Hiring Preferences (Individuals, Agencies, Both)
            table.jsonb('id_business_verification').nullable(); // ID/Business Verification (Govt ID or business registration docs)
            table.string('availability').defaultTo('Flexible'); // Availability (Part-time, Full-time, Flexible, On-Demand)

            table.string('address_line_first').defaultTo(null);
            table.string('address_line_second').defaultTo(null);
            table.string('city').nullable();
            table.string('state').nullable();
            table.string('country').nullable();
            table.string('pincode').nullable();
            table.decimal('latitude', 10, 8).nullable();
            table.decimal('longitude', 11, 8).nullable();
            table.string('password').nullable();
            table.boolean('aadhaar_verification').defaultTo(false);
            table.boolean('email_verified').defaultTo(false);
            table.boolean('phone_verified').defaultTo(false);
            table.text('reset_token').nullable();
            table.timestamp('reset_token_expires').nullable();
            table.string('login_attempts').defaultTo(0);
            table.boolean('kyc_verified').defaultTo(false);
            table.string('role').nullable();
            table.text('banned_reason').nullable();
            table.text('bio').nullable();
            table.string('timezone').nullable();
            table.jsonb('skill').nullable();
            table.boolean('email_notifications').nullable();
            table.jsonb('tags').defaultTo(DB.raw(`'[]'`));
            table.jsonb('notes').nullable();
            table.jsonb('certification').nullable();
            table.jsonb('education').nullable();
            table.jsonb('experience').nullable();
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
            table.string('account_type').nullable(); // (Freelancer, Client)
            table.integer('time_spent').defaultTo(0);
            table.string('account_status').defaultTo('Active'); // (Active, Inactive, Banned)
            table.boolean('is_active').defaultTo(true); // is_active is used to check if the user is active or not
            table.boolean('is_banned').defaultTo(false); // is_banned is used to check if the user is banned or not
            table.timestamp("created_at").defaultTo(DB.fn.now());
            table.timestamp("updated_at").defaultTo(DB.fn.now());
            table.integer("updated_by").nullable();
            table.boolean('is_deleted').defaultTo(false);
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


//   exports.seed = seed;
//   const run = async () => {
//      //createProcedure();
//       seed();
//   };
//   run();
