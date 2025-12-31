import DB from './index';

export const SYSTEM_ERROR_LOGS = 'system_error_logs';

export const seed = async (dropFirst = false) => {
    if (dropFirst) {
        await DB.schema.dropTableIfExists(SYSTEM_ERROR_LOGS);
    }

    await DB.schema.createTable(SYSTEM_ERROR_LOGS, table => {
        table.bigIncrements('id').primary();
        table.integer('status_code').notNullable();
        table.string('method').notNullable();
        table.text('path').notNullable();
        table.text('message').nullable();
        table.text('stack_trace').nullable();
        table.integer('user_id').nullable();
        table.string('ip_address').nullable();
        table.text('user_agent').nullable();
        table.jsonb('meta_data').nullable();
        table.timestamp('created_at').defaultTo(DB.fn.now());
    });
};
