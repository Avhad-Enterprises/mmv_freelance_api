// To migrate this schema: npm run migrate:schema -- document_verification [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- document_verification
//    - Creates/updates the document table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- document_verification --drop
//    - Completely drops and recreates the document table from scratch
//
import DB from './index.schema';

export const DOCUMENT = 'document';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTableIfExists(DOCUMENT);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');

        await DB.schema.createTable(DOCUMENT, table => {
            table.increments('document_id').primary();
            table.integer('user_id').unsigned().notNullable()
                .references('user_id')
                .inTable('users')
                .onDelete('CASCADE')
                .onUpdate('CASCADE');
            table.enum('document_type', ['aadhaar', 'passport', 'driver_license', 'voter_id', 'pan_card', 'utility_bill']).notNullable();
            table.string('document_upload').notNullable();    
            table.enum('status', ['pending', 'verified', 'rejected'])
                .defaultTo('pending').notNullable();
            table.integer('verified_by').nullable();
            table.timestamp('verified_at').nullable();
            table.text('rejection_reason').nullable();
            table.timestamp('created_at').defaultTo(DB.fn.now());
            table.timestamp('updated_at').defaultTo(DB.fn.now());
        });


        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${DOCUMENT}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log('Finished Creating Triggers');
    } catch (error) {
        console.log(error);
    }
};

// Migration function for schema-based migrations
export const migrate = async (dropFirst = false) => {
    // For schema-based migrations, always ensure clean state
    await seed(true); // Always drop and recreate for clean migrations
};

// Version: 1.0.0 - Document verification table for user identity documents
