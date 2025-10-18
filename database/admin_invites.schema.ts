// To migrate this schema: npm run migrate:schema -- admin_invites [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- admin_invites
//    - Creates/updates the invitation table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- admin_invites --drop
//    - Completely drops and recreates the invitation table from scratch
//
import DB from './index';

export const INVITATION_TABLE = 'invitation';

export const migrate = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.raw(`DROP TABLE IF EXISTS "${INVITATION_TABLE}" CASCADE`);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');

        // Check if table exists
        const tableExists = await DB.schema.hasTable(INVITATION_TABLE);

        if (!tableExists) {
            await DB.schema.createTable(INVITATION_TABLE, table => {
                table.increments('invitation_id').primary();

                // Invitee details
                table.string('first_name', 255).notNullable();
                table.string('last_name', 255).notNullable();
                table.string('email', 255).unique().notNullable();

                // Invitation details
                table.text('invite_token').notNullable();
                table.enum('status', ['pending', 'accepted', 'revoked', 'expired'])
                    .notNullable()
                    .defaultTo('pending');

                // Role assignment (will be assigned when user accepts invite)
                table.string('assigned_role', 50).nullable(); // References role.name

                // Security
                table.string('password', 255).nullable(); // Temporary password for invite

                // Relationships
                table.integer('invited_by').notNullable()
                    .references('user_id').inTable('users').onDelete('CASCADE');

                // Timestamps
                table.timestamp('expires_at').notNullable();
                table.timestamp('accepted_at').nullable();
                table.timestamp('created_at').defaultTo(DB.fn.now());
                table.timestamp('updated_at').defaultTo(DB.fn.now());

                // Audit
                table.boolean('is_deleted').defaultTo(false);
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
        } else {
            console.log('Table already exists, skipping creation');
        }
    } catch (error) {
        console.error('Migration failed for admin_invites:', error);
        throw error;
    }
};

// Version: 2.0.0 - Updated admin invites schema to match user/role patterns
// - Added proper foreign key constraints
// - Split full_name into first_name/last_name
// - Added table existence checks
// - Improved field naming and constraints
// - Added proper relationships