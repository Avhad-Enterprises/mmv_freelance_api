// To migrate this schema: npm run migrate:schema -- review [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- review
//    - Creates/updates the reviews table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- review --drop
//    - Completely drops and recreates the reviews table from scratch
//
import DB from './index.schema';

export const REVIEWS_TABLE = 'reviews';

export const seed = async (dropFirst = false) => {
  try {
    if (dropFirst) {
      console.log('Dropping Reviews Table');
      await DB.schema.dropTableIfExists(REVIEWS_TABLE);
      console.log('Dropped Reviews Table');
    }

    console.log('Seeding Reviews Table');

    await DB.schema.createTable(REVIEWS_TABLE, table => {
      table.increments('id').primary(); // Review ID
      table.integer('project_id').notNullable();
      table.integer('client_id').notNullable(); // Reviewer
      table.integer('user_id').notNullable(); // Freelancer receiving review

      table.integer('rating').notNullable(); // 1–5 stars
      table.text('review').notNullable();    // Actual review text

     
      table.boolean('is_deleted').defaultTo(false);
      table.timestamp('deleted_at').nullable();
      table.timestamp('created_at').defaultTo(DB.fn.now());
      table.timestamp('updated_at').defaultTo(DB.fn.now());
    });

    console.log('Creating Triggers');

    // Timestamp auto-update on edit
    await DB.raw(`
      CREATE TRIGGER update_timestamp
      BEFORE UPDATE
      ON ${REVIEWS_TABLE}
      FOR EACH ROW
      EXECUTE PROCEDURE update_timestamp();
    `);

    console.log('Finished Seeding Reviews Table');

  } catch (error) {
    console.error(error);
  }
};

// Migration function for schema-based migrations
export const migrate = async (dropFirst = false) => {
    // For schema-based migrations, always ensure clean state
    await seed(true); // Always drop and recreate for clean migrations
};

// Version: 1.0.0 - Reviews table for project feedback and ratings