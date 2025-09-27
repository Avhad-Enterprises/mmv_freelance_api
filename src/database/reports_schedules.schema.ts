import DB from './index.schema';

export const REPORT_SCHEDULES = 'report_schedules';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(REPORT_SCHEDULES);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        // await DB.raw("set search_path to public")
        await DB.schema.createTable(REPORT_SCHEDULES, table => {
            table.increments('id').primary(); //id
            table.integer('template_id').notNullable().references('id').inTable('report_templates').onDelete('CASCADE'); //id
            table.enu('interval',['daily','weekly']).notNullable();
            table.time('time').notNullable();
            table.specificType('email_to', 'text[]').notNullable();
            table.integer('created_by').notNullable();
            table.timestamp('last_run_at').nullable();
            table.timestamp('next_run_at').nullable();
            table.boolean("is_active").defaultTo(true);
            table.timestamp('created_at').defaultTo(DB.fn.now());
            table.timestamp('updated_at').defaultTo(DB.fn.now());
            table.integer('updated_by').nullable();
            table.boolean('is_deleted').defaultTo(false);
            table.integer('deleted_by').nullable();
            table.timestamp('deleted_at').nullable();

        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${REPORT_SCHEDULES}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log('Finished Creating Triggers');
    } catch (error) {
        console.log(error);
    }
};

//    exports.seed = seed;
//    const run = async () => {
//       //createProcedure();
//        seed();
//    };
//    run();
 