// To migrate this schema: npm run migrate:schema -- support_ticket_reply [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- support_ticket_reply
//    - Creates/updates the ticket_replies table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- support_ticket_reply --drop
//    - Completely drops and recreates the ticket_replies table from scratch
//
import DB from './index';

export const TICKET_REPLY_TABLE = 'ticket_replies';

export const migrate = async (dropFirst = false) => {
  try {
    if (dropFirst) {
      await DB.schema.dropTableIfExists(TICKET_REPLY_TABLE);
    }

    await DB.schema.createTable(TICKET_REPLY_TABLE, (table) => {
      table.increments('id').primary(); // unique reply ID

      table
        .integer('ticket_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('support_tickets')
        .onDelete('CASCADE'); // if a ticket is deleted, its replies also get deleted

      table.integer('sender_id').notNullable(); // ID of the person replying

      table.enu('sender_role', ['client', 'freelancer', 'admin']).notNullable(); // sender role

      table.text('message').notNullable(); // reply message

      table.timestamp('created_at').defaultTo(DB.fn.now()); // reply timestamp
    });

    console.log('Ticket reply table created with foreign key.');
  } catch (error) {
    console.error('Error creating ticket reply table:', error);
  }
};

// Version: 1.0.0 - Support ticket replies table for conversation threads