// To migrate this schema: npm run migrate:schema -- support_ticket_note [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- support_ticket_note
//    - Creates/updates the ticket_notes table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- support_ticket_note --drop
//    - Completely drops and recreates the ticket_notes table from scratch
//
import DB from './index';

export const TICKET_NOTE_TABLE = 'ticket_notes';

export const migrate = async (dropFirst = false) => {
  try {
    if (dropFirst) {
      await DB.schema.dropTableIfExists(TICKET_NOTE_TABLE);
    }

    await DB.schema.createTable(TICKET_NOTE_TABLE, (table) => {
      table.increments('id').primary(); // Unique note ID
table
        .integer('ticket_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('support_tickets')
        .onDelete('CASCADE');
          table.integer('admin_id').notNullable(); // ID of admin who added note

      table.text('note').notNullable(); // Internal note content

      table.timestamp('created_at').defaultTo(DB.fn.now()); // Timestamp of note creation
    });

    console.log('Ticket notes table created.');
  } catch (error) {
    console.error('Error creating ticket notes table:', error);
  }
};

// Version: 1.0.0 - Support ticket notes table for internal admin notes