// To migrate this schema: npm run migrate:schema -- contact [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- contact
//    - Creates/updates the contact_submissions table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- contact --drop
//    - Completely drops and recreates the contact_submissions table from scratch
//
import DB from './index';

export const CONTACT_SUBMISSIONS = 'contact_submissions';

export const migrate = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTableIfExists(CONTACT_SUBMISSIONS);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        await DB.schema.createTable(CONTACT_SUBMISSIONS, table => {
            table.increments('contact_id').primary();
            table.string('name', 255).notNullable();
            table.string('email', 255).notNullable();
            table.string('subject', 255).nullable();
            table.text('message').notNullable();
            table.string('ip_address', 45).nullable(); // IPv4/IPv6 support
            table.text('user_agent').nullable();
            table.enum('status', ['pending', 'responded', 'closed']).defaultTo('pending');
            table.text('notes').nullable();
            table.boolean("is_active").defaultTo(true);
            table.timestamp('created_at').defaultTo(DB.fn.now());
            table.timestamp('updated_at').defaultTo(DB.fn.now());
            table.boolean('is_deleted').defaultTo(false);
            table.timestamp('responded_at').nullable();
            table.timestamp('closed_at').nullable();
        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${CONTACT_SUBMISSIONS}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log('Finished Creating Triggers');

        // Create indexes for better performance
        console.log('Creating Indexes');
        await DB.schema.alterTable(CONTACT_SUBMISSIONS, table => {
            table.index(['email'], 'idx_contact_email');
            table.index(['status'], 'idx_contact_status');
            table.index(['created_at'], 'idx_contact_created_at');
            table.index(['is_active'], 'idx_contact_is_active');
        });
        console.log('Finished Creating Indexes');
    } catch (error) {
        console.error('Migration failed for contact_submissions:', error);
        throw error;
    }
};

// Version: 1.0.0 - Contact submissions table for storing contact form submissions