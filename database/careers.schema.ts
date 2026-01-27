// To migrate this schema: npm run migrate:schema -- careers [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- careers
//    - Creates/updates the careers table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- careers --drop
//    - Completely drops and recreates the careers table from scratch

import DB from './index';

export const CAREERS_TABLE = 'careers';

export const migrate = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTableIfExists(CAREERS_TABLE);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');

        const exists = await DB.schema.hasTable(CAREERS_TABLE);
        if (!exists) {
            await DB.schema.createTable(CAREERS_TABLE, table => {
                table.increments('job_id').primary();
                table.string('title').notNullable();
                table.text('short_description').notNullable();
                table.string('office_location').notNullable();
                table.text('detail_description').nullable();
                table.text('job_details').nullable();
                table.string('apply_link').notNullable();
                table.string('company_logo', 500).nullable(); // Company logo URL

                // Status and Audit fields
                table.boolean("is_active").defaultTo(true);
                table.integer('created_by').nullable();
                table.timestamp('created_at').defaultTo(DB.fn.now());
                table.timestamp('updated_at').defaultTo(DB.fn.now());
                table.integer('updated_by').nullable();
                table.boolean('is_deleted').defaultTo(false);
                table.integer('deleted_by').nullable();
                table.timestamp('deleted_at').nullable();
            });

            console.log('Finished Seeding Tables');
            await DB.raw(`
                CREATE TRIGGER update_timestamp
                BEFORE UPDATE
                ON ${CAREERS_TABLE}
                FOR EACH ROW
                EXECUTE PROCEDURE update_timestamp();
            `);
            console.log('Finished Creating Triggers');
        } else {
            console.log('Table already exists, checking for company_logo column...');
            const hasColumn = await DB.schema.hasColumn(CAREERS_TABLE, 'company_logo');
            if (!hasColumn) {
                await DB.schema.table(CAREERS_TABLE, table => {
                    table.string('company_logo', 500).nullable();
                });
                console.log('Added company_logo column');
            }
        }
    } catch (error) {
        console.error('Migration failed for careers:', error);
        throw error;
    }
};
