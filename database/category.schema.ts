// To migrate this schema: npm run migrate:schema -- category [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- category
//    - Creates/updates the category table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- category --drop
//    - Completely drops and recreates the category table from scratch
//
import DB from './index';

export const CATEGORY = 'category';

export const VIDEOGRAPHER_CATEGORIES = [
    'Reels & Short-Form Video',
    'Podcast Videography',
    'Smartphone & Mobile-First Videography',
    'Wedding Films',
    'Corporate Interviews & Testimonials',
    'Live-Streaming & Multi-Cam Operator',
    'Product & E-commerce Videography',
    'Fashion & Beauty Cinematography',
    'Real Estate & Architecture Videography',
    'Aerial / Drone Operation',
    'Business & Industrial Videography (Corporate AV, Factory Shoot, Trade Shows)',
    'Commercials & Ad Films (Digital & Broadcast)',
    'Music Videos & Live Performance Coverage',
    'Documentary & Narrative Storytelling',
    'Event & Conference Coverage',
    '360º / VR Videography',
    'Food & Beverage Videography',
    'Travel & Lifestyle Videography',
    'Educational & Explainer Videos'
];

export const EDITOR_CATEGORIES = [
    'YouTube Content Editing',
    'Short-Form & Social Media Ads',
    'Podcast & Interview Editing',
    'Wedding & Personal Event Films',
    'Generative AI Video Editing',
    'Gaming Video Editing',
    'Corporate & Brand Videos',
    'Documentary & Narrative Editing',
    'Event Highlight Reels',
    'Music Video Editing',
    'Motion Graphics & Explainer Videos',
    'VFX & Compositing',
    'Color Grading & Finishing',
    'Educational & eLearning Content',
    'Real Estate & Architectural Videos',
    'Sports Highlights & Analysis',
    'Movie Trailers & Sizzle Reels'
];

export const migrate = async (dropFirst = false) => {

    try {
        if (dropFirst) {
            console.log('Dropping Tables');
            await DB.schema.dropTableIfExists(CATEGORY);
            console.log('Dropped Tables');
        }
        console.log('Seeding Tables');

        await DB.schema.createTable(CATEGORY, table => {
            table.increments('category_id').primary();
            table.string("category_name").notNullable().unique();
            table.enu('category_type', ['videographer', 'editor']).notNullable();
            table.text('description').nullable();

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
          CREATE OR REPLACE FUNCTION update_timestamp()
          RETURNS TRIGGER AS $$
          BEGIN
              NEW.updated_at = CURRENT_TIMESTAMP;
              RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
        `);

        await DB.raw(`
          DROP TRIGGER IF EXISTS update_timestamp ON ${CATEGORY};
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${CATEGORY}
          FOR EACH ROW
          EXECUTE FUNCTION update_timestamp();
        `);

        console.log('Finished Creating Triggers');

        // Insert all videographer categories
        console.log('Inserting Videographer Categories');
        for (const category of VIDEOGRAPHER_CATEGORIES) {
            await DB(CATEGORY).insert({
                category_name: category,
                category_type: 'videographer',
                description: `${category} videography services`,
                is_active: true,
                is_deleted: false
            });
        }

        // Insert all editor categories
        console.log('Inserting Editor Categories');
        for (const category of EDITOR_CATEGORIES) {
            await DB(CATEGORY).insert({
                category_name: category,
                category_type: 'editor',
                description: `${category} editing services`,
                is_active: true,
                is_deleted: false
            });
        }

        console.log('All categories inserted successfully');

    } catch (error) {
        console.log(error);
    }
};

// Version: 1.0.0 - Categories table for project categorization

