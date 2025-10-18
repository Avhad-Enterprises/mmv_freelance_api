// To migrate this schema: npm run migrate:schema -- branding_assets [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- branding_assets
//    - Creates/updates the branding_assets table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- branding_assets --drop
//    - Completely drops and recreates the branding_assets table from scratch
//
import DB from './index';

export const BRANDING_ASSETS = 'branding_assets';

export const migrate = async (dropFirst = false) => {

    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTableIfExists(BRANDING_ASSETS);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        await DB.schema.createTable(BRANDING_ASSETS, table => {
            table.increments('id').primary();
            table.string('navbar_logo').nullable();
            table.string('navbar_logo_mobile').nullable();
            table.string('footer_logo').nullable();
            table.string('favicon').nullable();

            // compulsory columns
            table.boolean("is_active").defaultTo(true);
            table.boolean("is_deleted").defaultTo(false);
            table.integer("deleted_by").nullable();
            table.timestamp("deleted_at").nullable();
            table.integer("created_by").nullable();
            table.integer("updated_by").nullable();
            table.timestamp("created_at").defaultTo(DB.fn.now());
            table.timestamp("updated_at").defaultTo(DB.fn.now());
        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${BRANDING_ASSETS}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log('Finished Creating Triggers');
    } catch (error) {
        console.log(error);
    }
};

// Version: 1.0.0 - Branding assets table for storing logos and branding elements