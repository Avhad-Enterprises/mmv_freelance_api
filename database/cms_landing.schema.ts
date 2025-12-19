
// To migrate this schema: npm run migrate:schema -- cms_landing [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- cms_landing
//    - Creates/updates all CMS landing page tables while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- cms_landing --drop
//    - Completely drops and recreates all CMS landing page tables from scratch
//
import DB from './index';

// Table Names
export const CMS_HERO = 'cms_hero';
export const CMS_TRUSTED_COMPANIES = 'cms_trusted_companies';
export const CMS_WHY_CHOOSE_US = 'cms_why_choose_us';
export const CMS_FEATURED_CREATORS = 'cms_featured_creators';
export const CMS_SUCCESS_STORIES = 'cms_success_stories';
export const CMS_LANDING_FAQS = 'cms_landing_faqs';

export const migrate = async (dropFirst = false) => {
    try {
        if (dropFirst) {
            console.log('Dropping CMS Landing Page Tables...');
            await DB.schema.dropTableIfExists(CMS_LANDING_FAQS);
            await DB.schema.dropTableIfExists(CMS_SUCCESS_STORIES);
            await DB.schema.dropTableIfExists(CMS_FEATURED_CREATORS);
            await DB.schema.dropTableIfExists(CMS_WHY_CHOOSE_US);
            await DB.schema.dropTableIfExists(CMS_TRUSTED_COMPANIES);
            await DB.schema.dropTableIfExists(CMS_HERO);
            console.log('Dropped All CMS Landing Page Tables');
        }

        console.log('Creating CMS Landing Page Tables...');

        // 1. Hero Section Table
        if (!await DB.schema.hasTable(CMS_HERO)) {
            console.log(`Creating table: ${CMS_HERO}`);
            await DB.schema.createTable(CMS_HERO, table => {
                table.increments('id').primary();
                table.string('title', 255).notNullable();
                table.text('subtitle').nullable();
                table.text('description').nullable();
                table.string('primary_button_text', 100).nullable();
                table.string('primary_button_link', 255).nullable();
                table.string('secondary_button_text', 100).nullable();
                table.string('secondary_button_link', 255).nullable();
                table.text('background_image').nullable();
                table.text('hero_image').nullable();
                table.jsonb('custom_data').nullable();
                table.boolean('is_active').defaultTo(true);
                table.integer('sort_order').defaultTo(0);
                table.integer('created_by').notNullable();
                table.timestamp('created_at').defaultTo(DB.fn.now());
                table.timestamp('updated_at').defaultTo(DB.fn.now());
                table.integer('updated_by').nullable();
                table.boolean('is_deleted').defaultTo(false);
                table.integer('deleted_by').nullable();
                table.timestamp('deleted_at').nullable();
            });
            console.log(`✓ Created table: ${CMS_HERO}`);
        }

        // 2. Trusted Companies Table
        if (!await DB.schema.hasTable(CMS_TRUSTED_COMPANIES)) {
            console.log(`Creating table: ${CMS_TRUSTED_COMPANIES}`);
            await DB.schema.createTable(CMS_TRUSTED_COMPANIES, table => {
                table.increments('id').primary();
                table.string('company_name', 255).notNullable();
                table.text('logo_url').notNullable();
                table.string('website_url', 255).nullable();
                table.text('description').nullable();
                table.boolean('is_active').defaultTo(true);
                table.integer('sort_order').defaultTo(0);
                table.integer('created_by').notNullable();
                table.timestamp('created_at').defaultTo(DB.fn.now());
                table.timestamp('updated_at').defaultTo(DB.fn.now());
                table.integer('updated_by').nullable();
                table.boolean('is_deleted').defaultTo(false);
                table.integer('deleted_by').nullable();
                table.timestamp('deleted_at').nullable();
            });
            console.log(`✓ Created table: ${CMS_TRUSTED_COMPANIES}`);
        }

        // 3. Why Choose Us Table
        if (!await DB.schema.hasTable(CMS_WHY_CHOOSE_US)) {
            console.log(`Creating table: ${CMS_WHY_CHOOSE_US}`);
            await DB.schema.createTable(CMS_WHY_CHOOSE_US, table => {
                table.increments('id').primary();
                table.string('title', 255).notNullable();
                table.text('content').notNullable();
                table.string('icon', 255).nullable();
                table.jsonb('metadata').nullable();
                table.boolean('is_active').defaultTo(true);
                table.integer('sort_order').defaultTo(0);
                table.integer('created_by').notNullable();
                table.timestamp('created_at').defaultTo(DB.fn.now());
                table.timestamp('updated_at').defaultTo(DB.fn.now());
                table.integer('updated_by').nullable();
                table.boolean('is_deleted').defaultTo(false);
                table.integer('deleted_by').nullable();
                table.timestamp('deleted_at').nullable();
            });
            console.log(`✓ Created table: ${CMS_WHY_CHOOSE_US}`);
        }

        // 4. Featured Creators Table
        if (!await DB.schema.hasTable(CMS_FEATURED_CREATORS)) {
            console.log(`Creating table: ${CMS_FEATURED_CREATORS}`);
            await DB.schema.createTable(CMS_FEATURED_CREATORS, table => {
                table.increments('id').primary();
                table.string('name', 255).notNullable();
                table.string('title', 255).nullable();
                table.text('bio').nullable();
                table.text('profile_image').notNullable();
                table.string('portfolio_url', 255).nullable();
                table.string('social_linkedin', 255).nullable();
                table.string('social_twitter', 255).nullable();
                table.string('social_instagram', 255).nullable();
                table.jsonb('skills').nullable();
                table.jsonb('stats').nullable();
                table.boolean('is_active').defaultTo(true);
                table.integer('sort_order').defaultTo(0);
                table.integer('created_by').notNullable();
                table.timestamp('created_at').defaultTo(DB.fn.now());
                table.timestamp('updated_at').defaultTo(DB.fn.now());
                table.integer('updated_by').nullable();
                table.boolean('is_deleted').defaultTo(false);
                table.integer('deleted_by').nullable();
                table.timestamp('deleted_at').nullable();
            });
            console.log(`✓ Created table: ${CMS_FEATURED_CREATORS}`);
        }

        // 5. Success Stories Table
        if (!await DB.schema.hasTable(CMS_SUCCESS_STORIES)) {
            console.log(`Creating table: ${CMS_SUCCESS_STORIES}`);
            await DB.schema.createTable(CMS_SUCCESS_STORIES, table => {
                table.increments('id').primary();
                table.string('client_name', 255).notNullable();
                table.string('client_title', 255).nullable();
                table.text('client_image').nullable();
                table.text('testimonial').notNullable();
                table.integer('rating').nullable();
                table.string('project_type', 100).nullable();
                table.string('company', 255).nullable();
                table.string('company_logo', 255).nullable();
                table.jsonb('metadata').nullable();
                table.boolean('is_active').defaultTo(true);
                table.integer('sort_order').defaultTo(0);
                table.integer('created_by').notNullable();
                table.timestamp('created_at').defaultTo(DB.fn.now());
                table.timestamp('updated_at').defaultTo(DB.fn.now());
                table.integer('updated_by').nullable();
                table.boolean('is_deleted').defaultTo(false);
                table.integer('deleted_by').nullable();
                table.timestamp('deleted_at').nullable();
            });
            console.log(`✓ Created table: ${CMS_SUCCESS_STORIES}`);
        }

        // 6. Landing FAQs Table
        if (!await DB.schema.hasTable(CMS_LANDING_FAQS)) {
            console.log(`Creating table: ${CMS_LANDING_FAQS}`);
            await DB.schema.createTable(CMS_LANDING_FAQS, table => {
                table.increments('id').primary();
                table.string('category', 100).defaultTo('general');
                table.text('question').notNullable();
                table.text('answer').notNullable();
                table.jsonb('tags').nullable();
                table.boolean('is_active').defaultTo(true);
                table.integer('sort_order').defaultTo(0);
                table.integer('created_by').notNullable();
                table.timestamp('created_at').defaultTo(DB.fn.now());
                table.timestamp('updated_at').defaultTo(DB.fn.now());
                table.integer('updated_by').nullable();
                table.boolean('is_deleted').defaultTo(false);
                table.integer('deleted_by').nullable();
                table.timestamp('deleted_at').nullable();
            });
            console.log(`✓ Created table: ${CMS_LANDING_FAQS}`);
        }

        console.log('✓ All CMS Landing Page Tables Created Successfully');

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

        // Create triggers for all tables
        console.log('Creating Triggers...');
        const tables = [
            CMS_HERO,
            CMS_TRUSTED_COMPANIES,
            CMS_WHY_CHOOSE_US,
            CMS_FEATURED_CREATORS,
            CMS_SUCCESS_STORIES,
            CMS_LANDING_FAQS
        ];

        for (const tableName of tables) {
            try {
                // Try to drop existing trigger first (to avoid conflicts)
                await DB.raw(`DROP TRIGGER IF EXISTS update_timestamp ON ${tableName};`);

                // Create the trigger
                await DB.raw(`
                    CREATE TRIGGER update_timestamp
                    BEFORE UPDATE
                    ON ${tableName}
                    FOR EACH ROW
                    EXECUTE FUNCTION update_timestamp();
                `);
                console.log(`✓ Created trigger for: ${tableName}`);
            } catch (triggerError: any) {
                // Trigger might already exist or table doesn't exist yet
                console.log(`ℹ Trigger for ${tableName}: ${triggerError.message || 'skipped'}`);
            }
        }

        console.log('✓ All Triggers Created Successfully');

    } catch (error) {
        console.error('Migration failed for CMS Landing Pages:', error);
        throw error;
    }
};

// Version: 1.0.0 - CMS Landing Page tables for hero, companies, why choose us, creators, testimonials, and FAQs
