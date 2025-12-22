/**
 * Credit Settings Schema
 * Global configuration for credit system
 */

import DB from './index';

export const CREDIT_SETTINGS_TABLE = 'credit_settings';

export const migrate = async (dropFirst = false) => {
    if (dropFirst) {
        await DB.schema.dropTableIfExists(CREDIT_SETTINGS_TABLE);
    }

    const exists = await DB.schema.hasTable(CREDIT_SETTINGS_TABLE);

    if (!exists) {
        await DB.schema.createTable(CREDIT_SETTINGS_TABLE, (table) => {
            table.string('setting_key', 100).primary();
            table.text('setting_value').notNullable(); // Stored as string, parsed in app
            table.string('description', 255);
            table.integer('updated_by').references('user_id').inTable('users');
            table.timestamp('updated_at').defaultTo(DB.fn.now());
        });

        console.log(`✅ Created table: ${CREDIT_SETTINGS_TABLE}`);

        // Seed default values
        await DB(CREDIT_SETTINGS_TABLE).insert([
            {
                setting_key: 'price_per_credit',
                setting_value: '50',
                description: 'Price per single credit in INR'
            }
        ]);
        console.log('✅ Seeded default credit settings');

    } else {
        console.log(`ℹ️ Table already exists: ${CREDIT_SETTINGS_TABLE}`);
    }
};

export const rollback = async () => {
    await DB.schema.dropTableIfExists(CREDIT_SETTINGS_TABLE);
    console.log(`🗑️ Dropped table: ${CREDIT_SETTINGS_TABLE}`);
};

export default { migrate, rollback, CREDIT_SETTINGS_TABLE };
