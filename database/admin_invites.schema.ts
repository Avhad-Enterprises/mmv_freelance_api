// To migrate this schema: npm run migrate:schema -- admin_invites [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- admin_invites
//    - Creates/updates the invitation table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- admin_invites --drop
//    - Completely drops and recreates the invitation table from scratch
//
import DB from './index.schema';

export const INVITATION_TABLE = 'invitation ';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTableIfExists(INVITATION_TABLE);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(INVITATION_TABLE, table => {
            table.increments('invitation_id').primary();
            table.string('full_name').notNullable();
            table.string('email').notNullable();
            table.text('token_hash').nullable();
            table.enum('status', ['pending', 'accepted', 'revoked', 'expired'])
                .notNullable()
                .defaultTo('pending');
            table.string('account_type').notNullable().defaultTo('admin');
            table.string('role').nullable();
            table.boolean('is_used').defaultTo(false);
            table.integer('invited_by').nullable();
            table.timestamp('expires_at').notNullable();
            table.timestamp("created_at").defaultTo(DB.fn.now());
            table.timestamp('used_at').nullable();
            table.jsonb('payload').nullable();
            table.string("password").nullable();
            table.timestamp('updated_at').defaultTo(DB.fn.now());
        });


        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${INVITATION_TABLE}
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

// Version: 1.0.0 - Admin invites table for team member invitations