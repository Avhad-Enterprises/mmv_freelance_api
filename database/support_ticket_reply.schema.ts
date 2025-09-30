import DB from './index.schema';

export const TICKET_REPLY_TABLE = 'ticket_replies';

export const seed = async (dropFirst = false) => {
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
  // exports.seed = seed;
  // const run = async () => {
  //    //createProcedure();
  //     seed(true);
  // };
  // run();