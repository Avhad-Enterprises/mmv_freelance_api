// To migrate this schema: npm run migrate:schema -- applied_projects [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- applied_projects
//    - Creates/updates the applied_projects table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- applied_projects --drop
//    - Completely drops and recreates the applied_projects table from scratch
//
import DB from './index.schema';

export const APPLIED_PROJECTS = 'applied_projects';

// Migration function for schema-based migrations
export const migrate = async () => {
    const tableExists = await DB.schema.hasTable(APPLIED_PROJECTS);
    if (!tableExists) {
        console.log('Applied Projects table does not exist, creating...');
        console.log('Creating Applied Projects Table');
        await DB.schema.createTable(APPLIED_PROJECTS, table => {
            table.increments('applied_projects_id').primary();
            table.integer("projects_task_id").notNullable()
                .references('projects_task_id')
                .inTable('projects_task')
                .onDelete('CASCADE');
            table.integer("user_id").notNullable()
                .references('id')
                .inTable('users')
                .onDelete('CASCADE');
            table.integer("freelancer_id")
                .unsigned()
                .nullable() // or .notNullable() if you enforce
                .references('freelancer_id')
                .inTable('freelancer_profiles')
                .onDelete('CASCADE');

            table.integer("status").notNullable().defaultTo(0); // 0: pending, 1: ongoing, 2: completed
            table.text('description');
            // compulsory columns
            table.boolean("is_active").defaultTo(true);
            table.boolean("is_deleted").defaultTo(false);
            table.integer("deleted_by").nullable()
                .references('id')
                .inTable('users')
                .onDelete('SET NULL');
            table.timestamp("deleted_at").nullable();
            table.integer("created_by").nullable()
                .references('id')
                .inTable('users')
                .onDelete('SET NULL');
            table.integer("updated_by").nullable()
                .references('id')
                .inTable('users')
                .onDelete('SET NULL');
            table.timestamp("created_at").defaultTo(DB.fn.now());
            table.timestamp("updated_at").defaultTo(DB.fn.now());

        });
        console.log('Created Applied Projects Table');
        
        console.log('Creating Triggers for Applied Projects Table');
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${APPLIED_PROJECTS}
          FOR EACH ROW
          EXECUTE PROCEDURE update_timestamp();
        `);
        console.log('Finished Creating Triggers');
    } else {
        console.log('Applied Projects table already exists, skipping migration');
    }
};// Version: 1.0.0 - Applied projects table for tracking freelancer applications
