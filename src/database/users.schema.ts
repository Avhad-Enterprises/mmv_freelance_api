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
            table.string('first_name').notNullable;
            table.string('last_name').nullable;
            table.string('username').notNullable();
            table.string('email').unique();
            table.string('phone_number').notNullable();
            table.string('profile_picture').nullable();
            table.string('address_line_first').defaultTo(null);
            table.string('address_line_second').defaultTo(null);
            table.string('city').nullable();
            table.string('state').nullable();
            table.string('country').nullable();
            table.string('pincode').nullable();
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
            table.jsonb('experience').nullable()
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
            table.string('availability').nullable();
            table.integer('time_spent').defaultTo(0);
            table.string('account_status').defaultTo('1'); // (Active, Inactive, Banned)
            table.boolean('is_active').defaultTo(true); // is_active is used to check if the user is active or not
            table.boolean('is_banned').defaultTo(false); // is_banned is used to check if the user is banned or not
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
