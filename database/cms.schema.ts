// To migrate this schema: npm run migrate:schema -- cms [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- cms
//    - Creates/updates the cms table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- cms --drop
//    - Completely drops and recreates the cms table from scratch
//
// Section Types: 'hero', 'trusted_company', 'why_choose_us', 'featured_creator', 'success_story', 'landing_faq', 'general'
//
import DB from './index';

export const CMS = 'cms';

export const migrate = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping CMS Table');
            await DB.schema.dropTableIfExists(CMS);
            console.log('Dropped CMS Table');
        }
        console.log('Creating CMS Table');
        await DB.schema.createTable(CMS, table => {
            table.increments('cms_id').primary();
            
            // Section Type - determines which fields are relevant
            table.string('section_type', 50).notNullable().comment('hero, trusted_company, why_choose_us, featured_creator, success_story, landing_faq, general');
            
            // Common Fields (used by all sections)
            table.string('title', 255).nullable();
            table.text('description').nullable();
            table.text('content').nullable();
            
            // Images & Media
            table.text('image').nullable();                    // General image
            table.text('carousel').nullable();                 // Multiple images: "img1.jpg,img2.jpg"
            table.text('background_image').nullable();         // Hero: background
            table.text('hero_image').nullable();               // Hero: hero image
            table.text('logo_url').nullable();                 // Trusted Companies: logo
            table.text('profile_image').nullable();            // Featured Creators: profile
            table.text('client_image').nullable();             // Success Stories: client image
            table.string('company_logo', 255).nullable();      // Success Stories: company logo
            table.string('icon', 255).nullable();              // Why Choose Us: icon
            
            // Text Content
            table.text('subtitle').nullable();                 // Hero: subtitle
            table.text('bio').nullable();                      // Featured Creators: bio
            table.text('testimonial').nullable();              // Success Stories: testimonial
            table.text('question').nullable();                 // Landing FAQs: question
            table.text('answer').nullable();                   // Landing FAQs: answer
            
            // Links & URLs
            table.string('link_1').nullable();
            table.string('link_2').nullable();
            table.string('link_3').nullable();
            table.string('primary_button_text', 100).nullable();    // Hero: primary button
            table.string('primary_button_link', 255).nullable();
            table.string('secondary_button_text', 100).nullable();  // Hero: secondary button
            table.string('secondary_button_link', 255).nullable();
            table.string('website_url', 255).nullable();            // Trusted Companies: website
            table.string('portfolio_url', 255).nullable();          // Featured Creators: portfolio
            
            // Names & Identifiers
            table.string('company_name', 255).nullable();      // Trusted Companies: name
            table.string('client_name', 255).nullable();       // Success Stories: client name
            table.string('client_title', 255).nullable();      // Success Stories: client title
            table.string('name', 255).nullable();              // Featured Creators: name
            
            // Social Media Links
            table.string('social_linkedin', 255).nullable();   // Featured Creators: LinkedIn
            table.string('social_twitter', 255).nullable();    // Featured Creators: Twitter
            table.string('social_instagram', 255).nullable();  // Featured Creators: Instagram
            
            // Additional Data
            table.string('project_type', 100).nullable();      // Success Stories: project type
            table.string('company', 255).nullable();           // Success Stories: company
            table.integer('rating').nullable();                // Success Stories: rating (1-5)
            
            // JSON Fields for flexible data
            table.jsonb('stats').nullable();                   // Featured Creators: statistics
            table.jsonb('metadata').nullable();                // Why Choose Us, Success Stories: additional data
            table.jsonb('custom_data').nullable();             // Hero: custom data
            
            // Status & Ordering
            table.boolean('is_active').defaultTo(true);
            table.integer('sort_order').defaultTo(0);
            
            // Audit Fields
            table.integer('created_by').notNullable();
            table.timestamp('created_at').defaultTo(DB.fn.now());
            table.timestamp('updated_at').defaultTo(DB.fn.now());
            table.integer('updated_by').nullable();
            table.boolean('is_deleted').defaultTo(false);
            table.integer('deleted_by').nullable();
            table.timestamp('deleted_at').nullable();
            
            // Indexes for better query performance
            // Indexes for better query performance
            table.index('section_type');
            table.index(['section_type', 'is_active', 'is_deleted']);
            table.index('sort_order');
        });

        console.log('✓ CMS Table Created Successfully');
        
        // Create update_timestamp function if it doesn't exist
        console.log('Creating update_timestamp function...');
        try {
            await DB.raw(`
                CREATE OR REPLACE FUNCTION update_timestamp() RETURNS TRIGGER
                LANGUAGE plpgsql
                AS
                $$
                BEGIN
                    NEW.updated_at = CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$;
            `);
            console.log('✓ update_timestamp function created/updated');
        } catch (fnError) {
            console.log('ℹ update_timestamp function might already exist, continuing...');
        }

        console.log('Creating Triggers');
        // Drop existing trigger first
        await DB.raw(`DROP TRIGGER IF EXISTS update_timestamp ON ${CMS};`);
        
        await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${CMS}
          FOR EACH ROW
          EXECUTE FUNCTION update_timestamp();
        `);
        console.log('✓ Finished Creating Triggers');
    } catch (error) {
        console.error('Migration failed for cms:', error);
        throw error;
    }
};

// Version: 2.0.0 - Unified CMS table for all content types including landing page sections
// Section Types: 
// - 'hero' - Hero sections with titles, images, buttons
// - 'trusted_company' - Company logos and information
// - 'why_choose_us' - Feature highlights with icons
// - 'featured_creator' - Creator profiles with social links
// - 'success_story' - Client testimonials and reviews
// - 'landing_faq' - Landing page FAQs
// - 'general' - General CMS content

