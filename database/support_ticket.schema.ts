// db/support_tickets.schema.ts
import DB from './index.schema';

export const SUPPORT_TICKETS_TABLE = 'support_tickets';

export const seed = async (dropFirst = false) => {
  try {
    if (dropFirst) {
      console.log('Dropping Tables');
      await DB.schema.dropTable(SUPPORT_TICKETS_TABLE);
      console.log('Dropped Tables');
    }
    console.log('Seeding Tables');
    await DB.schema.createTable(SUPPORT_TICKETS_TABLE, table => {
      table.increments('id').primary();
      table.integer('user_id').notNullable();
      table.integer('client_id').nullable();
      table.integer('project_id').nullable();
      table.string('ticket_category').notNullable();
      table.string('title').notNullable();
      table.string('subject').notNullable();
      table.text('description').notNullable();
      table.enu('priority', ['low', 'medium', 'high', 'urgent']).defaultTo('low');
      table.integer('assigned_agent_id').nullable();
      table.timestamp('project_asign_date').nullable();
      table.string('response_time').nullable();
      table.timestamp('resolution_date').nullable();
      table.jsonb('communication_logs').nullable();
      table.text('resolution_notes').nullable();
      table.integer('satisfaction_rating').nullable();
      table.text('feedback_comment').nullable();
      table.string('payment_type').nullable();
      table.string('platform_used').nullable();
      table.string('support_language').nullable();
      table.string('email').nullable();
      table.string('location').nullable();
      table.string('ip_address').nullable();
      table.string('os_info').nullable();
      table.string('browser_info').nullable();
      table.enu('status', ['open', 'in_progress', 'resolved', 'closed']).defaultTo('open');
      table.integer('created_by').nullable();
      table.timestamp('created_at').defaultTo(DB.fn.now());
      table.timestamp('updated_at').defaultTo(DB.fn.now());
      table.integer('updated_by').nullable();
      table.boolean('is_deleted').defaultTo(false);
      table.integer('deleted_by').nullable();
      table.timestamp('deleted_at').nullable();
    });

    console.log('Creating Triggers');
    await DB.raw(`
      CREATE TRIGGER update_timestamp_support
      BEFORE UPDATE ON ${SUPPORT_TICKETS_TABLE}
      FOR EACH ROW
      EXECUTE PROCEDURE update_timestamp();
    `);
    console.log('Finished Creating Triggers');
  } catch (error) {
    console.error('Error seeding support_tickets table:', error);
  }
};

  // exports.seed = seed;
  // const run = async () => {
  //    //createProcedure();
  //     seed();
  // };
  // run();
