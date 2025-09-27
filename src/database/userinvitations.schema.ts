
import DB from './index.schema';

export const USERINVITATIONS = 'user_invitations';

export const seed = async (dropFirst = false) => {

    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(USERINVITATIONS);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        await DB.schema.createTable(USERINVITATIONS, table => {
            table.increments('id').primary();
            table.string('full_name').notNullable();
            table.string('email').notNullable().unique();
            table.string('department').nullable();
            table.string('job_title').nullable();
            table.text('invite_token').notNullable();
            table.timestamp('expires_at').notNullable();
            table.boolean('used').defaultTo(false);
            table.boolean('is_deleted').defaultTo(false);
            table.timestamp('created_at').defaultTo(DB.fn.now());
        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${USERINVITATIONS}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log('Finished Creating Triggers');
    } catch (error) {
        console.log(error);
    }
};

//  exports.seed = seed;
//  const run = async () => {
//      //createProcedure();
//      seed();
//  };
//  run();
