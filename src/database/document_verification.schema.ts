import DB from './index.schema';

export const DOCUMENT = 'document';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(DOCUMENT);
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

//   exports.seed = seed;
//   const run = async () => {
//      //createProcedure();
//       seed();
//   };
//   run();
