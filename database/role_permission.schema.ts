import DB from './index.schema';

export const ROLE_PERMISSION = 'role_permission';

export const seed = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTable(ROLE_PERMISSION);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');
        await DB.schema.createTable(ROLE_PERMISSION, table => {
            table.increments('id').primary(); 
            table.integer('role_id').notNullable();  
            table.integer('permission_id').notNullable();  
            table.primary(['role_id', 'permission_id']);  
            table.foreign('role_id').references('roles.id').onDelete('CASCADE'); 
            table.foreign('permission_id').references('permissions.id').onDelete('CASCADE');  
        });

        console.log('Finished Seeding Tables');
        console.log('Creating Triggers');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${ROLE_PERMISSION}
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
//     //createProcedure();
//      seed();
//  };
//  run();

