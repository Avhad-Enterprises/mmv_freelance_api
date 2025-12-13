// OAuth Accounts Database Schema
// Creates the oauth_accounts table for storing OAuth provider links
//
// To migrate this schema: npm run migrate:schema -- oauth_accounts [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- oauth_accounts
//    - Creates the oauth_accounts table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- oauth_accounts --drop
//    - Completely drops and recreates the table from scratch
//
// Version: 1.0.0 - Initial OAuth support for Google authentication

export const OAUTH_ACCOUNTS_TABLE = 'oauth_accounts';

// Note: migrate function is only called directly, not on import
// This avoids circular dependency with database/index.ts
export const migrate = async (dropFirst = false) => {
    // Dynamic import to avoid circular dependency
    const { default: DB } = await import('./index');

    try {
        if (dropFirst) {
            console.log('Dropping OAuth Accounts Table');
            await DB.raw(`DROP TABLE IF EXISTS ${OAUTH_ACCOUNTS_TABLE} CASCADE`);
            console.log('Dropped OAuth Accounts Table');
        }

        // Check if table exists
        const tableExists = await DB.schema.hasTable(OAUTH_ACCOUNTS_TABLE);

        if (!tableExists) {
            console.log('Creating OAuth Accounts Table');
            await DB.schema.createTable(OAUTH_ACCOUNTS_TABLE, table => {
                // Primary key
                table.increments('id').primary();

                // User reference
                table.integer('user_id').unsigned().notNullable();

                // OAuth provider information
                table.string('provider', 50).notNullable()
                    .comment('OAuth provider name: google, facebook, apple');
                table.string('provider_user_id', 255).notNullable()
                    .comment('Unique user ID from the OAuth provider');

                // OAuth tokens (base64 encoded for basic security)
                table.text('access_token').nullable()
                    .comment('OAuth access token (base64 encoded)');
                table.text('refresh_token').nullable()
                    .comment('OAuth refresh token (base64 encoded)');
                table.timestamp('token_expires_at').nullable()
                    .comment('When the access token expires');

                // Provider metadata
                table.jsonb('provider_data').nullable()
                    .comment('Raw response from OAuth provider for debugging');

                // Timestamps
                table.timestamp('created_at').defaultTo(DB.fn.now());
                table.timestamp('updated_at').defaultTo(DB.fn.now());

                // Foreign key constraint
                table.foreign('user_id')
                    .references('user_id')
                    .inTable('users')
                    .onDelete('CASCADE')
                    .onUpdate('CASCADE');

                // Unique constraints
                // Each user can only have one account per provider
                table.unique(['user_id', 'provider'], 'uk_oauth_user_provider');
                // Each provider account can only be linked to one user
                table.unique(['provider', 'provider_user_id'], 'uk_oauth_provider_userid');

                // Indexes for faster lookups
                table.index(['provider', 'provider_user_id'], 'idx_oauth_provider_user');
                table.index(['user_id'], 'idx_oauth_user_id');
            });

            console.log('Finished Creating OAuth Accounts Table');

            // Create update trigger
            console.log('Creating Triggers');
            await DB.raw(`
                CREATE OR REPLACE TRIGGER update_oauth_accounts_timestamp
                BEFORE UPDATE
                ON ${OAUTH_ACCOUNTS_TABLE}
                FOR EACH ROW
                EXECUTE PROCEDURE update_timestamp();
            `);
            console.log('Finished Creating Triggers');
        } else {
            console.log('OAuth Accounts Table already exists, skipping creation');
        }

        // Ensure users table has email_verified column
        const hasEmailVerified = await DB.schema.hasColumn('users', 'email_verified');
        if (!hasEmailVerified) {
            console.log('Adding email_verified column to users table');
            await DB.schema.alterTable('users', table => {
                table.boolean('email_verified').defaultTo(false);
            });
            console.log('Added email_verified column to users table');
        }

    } catch (error) {
        console.error('Migration failed for oauth_accounts:', error);
        throw error;
    }
};

// Knex migration format (for knex migrate:latest)
export async function up(knex: any): Promise<void> {
    await migrate(false);
}

export async function down(knex: any): Promise<void> {
    await knex.schema.dropTableIfExists(OAUTH_ACCOUNTS_TABLE);
}
