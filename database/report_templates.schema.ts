// To migrate this schema: npm run migrate:schema -- report_templates [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- report_templates
//    - Creates/updates the report_templates table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- report_templates --drop
//    - Completely drops and recreates the report_templates table from scratch
//
import DB from './index';

export const REPORT_TEMPLATES = 'report_templates';

export const migrate = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.raw(`DROP TABLE IF EXISTS "${REPORT_TEMPLATES}" CASCADE`);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        
        // Check if table exists
        const tableExists = await DB.schema.hasTable(REPORT_TEMPLATES);
        
        if (!tableExists) {
            // await DB.raw("set search_path to public")
            await DB.schema.createTable(REPORT_TEMPLATES, table => {
                table.increments('id').primary(); //id
                table.string('report_module',50).notNullable();
                table.string('title',100).nullable();
                table.jsonb('filters').nullable();
                table.jsonb('metrics').nullable();
                table.string('group_by',50).nullable();
                table.string('visual_type',30).nullable();
                table.integer('created_by').notNullable();
                table.boolean('is_active').defaultTo(true);
                table.timestamp("created_at").defaultTo(DB.fn.now());
                table.timestamp("updated_at").defaultTo(DB.fn.now());
                table.boolean('is_deleted').defaultTo(false);
                table.string("email").unique();

            });

            console.log('Finished Seeding Tables');
            console.log('Creating Triggers');
            await DB.raw(`
              CREATE TRIGGER update_timestamp
              BEFORE UPDATE
              ON ${REPORT_TEMPLATES}
              FOR EACH ROW
              EXECUTE PROCEDURE update_timestamp();
            `);
            console.log('Finished Creating Triggers');
        } else {
            console.log('Table already exists, skipping creation');
        }
    } catch (error) {
        console.error('Migration failed for report_templates:', error);
        throw error;
    }
};

// Version: 1.0.0 - Report templates table for customizable report configurations
 