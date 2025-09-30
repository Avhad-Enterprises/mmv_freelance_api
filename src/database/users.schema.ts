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
            table.string("full_name").notNullable();
            table.string('username').notNullable();
            table.string('phone_number').notNullable();
            table.string('email').unique();
            table.string('password').nullable();
            table.string('profile_picture').nullable();
            
       
            // Freelancer-specific fields
            table.string("profile_title").notNullable();
            table.jsonb('skill').nullable();
            table.jsonb('category_services').nullable();
            table.enu("experience_level", ["Beginner", "Intermediate", "Expert"]).notNullable();
            table.jsonb("portfolio_links").defaultTo("[]");
            table.decimal("hourly_rate", 10, 2).nullable();
            table.decimal("project_rate", 10, 2).nullable();
            table.string("currency", 10).defaultTo("USD");
            table.enu("availability", ["Part-time", "Full-time", "Flexible", "On-Demand"]).notNullable();
            table.enu("work_type", ["Remote Only", "On-Site", "Hybrid"]).notNullable();
           table.jsonb('languages_spoken').defaultTo(DB.raw(`'[]'`)); // Languages Spoken
            table.enu("id_type", [
                "Aadhaar",
                "PAN",
                "Passport",
                "Driving Licence",
                "Voter ID",
                "Other",
            ]).nullable();
            table.string("id_document_url").nullable();
            table.smallint("hours_per_week").nullable(); // e.g., 10–60
            // Client-specific fields
            table.string("company_name").notNullable();                         // Company/Brand Name
            table.string('industry').nullable(); // Industry (Film, Ad Agency, etc.)                // e.g. ['Film','Ad Agency','Events']
            table.jsonb('website_links').nullable();                   // [{type:'website'|'linkedin'|'youtube'|'instagram'|..., url:'...'}]
            table.enu("company_size", ["1-10", "11-50", "51-200", "200+"]).nullable();
            table.specificType("services_required", "TEXT[]").nullable();       // ['Videography','Editing','Motion Graphics',...]
            table.decimal("avg_budget_min", 12, 2).nullable();                  // e.g., 10000.00
            table.decimal("avg_budget_max", 12, 2).nullable();                  // e.g., 250000.00
            table.string("budget_currency", 10).defaultTo("INR");               // INR by default
            table.enu("preferred_work_arrangement", ["Remote", "On-site", "Hybrid"]).nullable();
            table.enu("project_frequency", ["One-time", "Occasional", "Ongoing"]).nullable();
            table.enu("hiring_preferences", ["Individuals", "Agencies", "Both"]).nullable();

            table.string("otp_code").nullable(); // temp storage during verification
            table.boolean("phone_verified").defaultTo(false);
            table.string('address_line_first').defaultTo(null);
            table.string('address_line_second').defaultTo(null);
            table.string('city').nullable();
            table.string('state').nullable();
            table.string('country').nullable();
            table.string('pincode').nullable();
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
            table.string('account_type').nullable(); // (Freelancer, Client)
            table.integer('time_spent').defaultTo(0);
            table.string('account_status').defaultTo('1'); // (Active, Inactive, Banned)
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


//   exports.seed = seed;
//   const run = async () => {
//      //createProcedure();
//       seed();
//   };
//   run();