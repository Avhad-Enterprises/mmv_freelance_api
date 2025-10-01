// To migrate this schema: npm run migrate:schema -- emailog [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- emailog
//    - Creates/updates the email_logs table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- emailog --drop
//    - Completely drops and recreates the email_logs table from scratch
//
import DB from './index.schema';

export const EMAIL_LOG_TABLE = 'email_logs';

export const seed = async (dropFirst = false) => {
  try {
    if (dropFirst) {
      await DB.schema.dropTableIfExists(EMAIL_LOG_TABLE);
    }

    await DB.schema.createTable(EMAIL_LOG_TABLE, (table) => {
      table.increments('id').primary(); // Unique log ID
      table
        .integer('ticket_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('support_tickets')
        .onDelete('CASCADE');

      table.string('to_email').notNullable(); // Recipient email address

      table.string('subject').notNullable(); // Email subject

      table.text('body').notNullable(); // Full email body

      table.enu('status', ['sent', 'failed']).notNullable(); // Email status

      table.timestamp('sent_at').defaultTo(DB.fn.now()); // Timestamp when sent
    });

    console.log('Email logs table created.');
  } catch (error) {
    console.error('Error creating email logs table:', error);
  }
};

// Migration function - call this to migrate the schema
export const migrate = async (dropFirst = false) => {
  await seed(dropFirst);
};

// Version: 1.0.0 - Initial schema creation