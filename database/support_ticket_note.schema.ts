import DB from './index.schema';

export const TICKET_NOTE_TABLE = 'ticket_notes';

export const seed = async (dropFirst = false) => {
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
  // exports.seed = seed;
  // const run = async () => {
  //    //createProcedure();
  //     seed(true);
  // };
  // run();