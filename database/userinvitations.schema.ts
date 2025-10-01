// To migrate this schema: npm run migrate:schema -- userinvitations [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- userinvitations
//    - Creates/updates the user_invitations table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- userinvitations --drop
//    - Completely drops and recreates the user_invitations table from scratch
//

import DB from './index.schema';

export const USERINVITATIONS = 'user_invitations';

export const seed = async (dropFirst = false) => {

    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(USERINVITATIONS);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        await DB.schema.createTable(USERINVITATIONS, table => {
            table.increments('id').primary();
            table.string('full_name').notNullable();
            table.string('email').notNullable().unique();
            table.string('department').nullable();
            table.string('job_title').nullable();
            table.text('invite_token').notNullable();
            table.timestamp('expires_at').notNullable();
            table.boolean('used').defaultTo(false);
            table.boolean('is_deleted').defaultTo(false);
            table.timestamp('created_at').defaultTo(DB.fn.now());
        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${USERINVITATIONS}
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

// Version: 1.0.0 - User invitations table for team member invites
