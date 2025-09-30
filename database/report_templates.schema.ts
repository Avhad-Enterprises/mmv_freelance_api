import DB from './index.schema';

export const REPORT_TEMPLATES = 'report_templates';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(REPORT_TEMPLATES);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
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
 