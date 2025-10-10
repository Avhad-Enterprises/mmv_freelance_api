// To migrate this schema: npm run migrate:schema -- saved_project [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- saved_project
//    - Creates/updates the saved_projects table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- saved_project --drop
//    - Completely drops and recreates the saved_projects table from scratch
//
import DB from './index.schema';

export const SAVED_PROJECTS = 'saved_projects';

// Migration function for schema-based migrations
export const migrate = async (dropFirst = false) => {
    if (dropFirst) {
        console.log('Dropping Saved Projects Table');
        await DB.schema.dropTableIfExists(SAVED_PROJECTS);
        console.log('Dropped Saved Projects Table');
    }

    const tableExists = await DB.schema.hasTable(SAVED_PROJECTS);
    if (!tableExists) {
        console.log('Saved Projects table does not exist, creating...');
        console.log('Creating Saved Projects Table');
        await DB.schema.createTable(SAVED_PROJECTS, table => {
            table.increments('saved_projects_id').primary();
            table.integer("projects_task_id").notNullable()
                .references('projects_task_id')
                .inTable('projects_task')
                .onDelete('CASCADE');
            table.integer("user_id").notNullable()
                .references('user_id')
                .inTable('users')
                .onDelete('CASCADE');
            table.boolean("is_active").defaultTo(true);
            table.integer("created_by").nullable()
                .references('user_id')
                .inTable('users')
                .onDelete('SET NULL');
            table.timestamp('created_at').defaultTo(DB.fn.now())
            table.integer("updated_by").nullable()
                .references('user_id')
                .inTable('users')
                .onDelete('SET NULL');
            table.timestamp("updated_at").defaultTo(DB.fn.now());
            table.boolean("is_deleted").defaultTo(false);
            table.integer("deleted_by").nullable()
                .references('user_id')
                .inTable('users')
                .onDelete('SET NULL');
            table.timestamp("deleted_at").nullable();
        });
        console.log('Created Saved Projects Table');
        
        console.log('Creating Triggers for Saved Projects Table');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${SAVED_PROJECTS}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log('Finished Creating Triggers');
    } else {
        console.log('Saved Projects table already exists, skipping migration');
    }
};

// Version: 1.0.0 - Saved projects table for user's bookmarked projects