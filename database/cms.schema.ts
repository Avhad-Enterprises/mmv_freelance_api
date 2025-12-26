// To migrate this schema: npm run migrate:schema -- cms [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- cms
//    - Creates/updates the cms table while preserving existing data
//
// 2. Drop and Recreate: npm run migrate:schema -- cms --drop
//    - Completely drops and recreates the cms table from scratch
//
// Section Types: 'hero', 'trusted_company', 'why_choose_us', 'featured_creator', 'success_story', 'landing_faq', 'social_media'
//
import DB from "./index";

export const CMS = "cms";

export const migrate = async (dropFirst = false) => {
  try {
    if (dropFirst) {
      console.log("Dropping CMS Table");
      await DB.schema.dropTableIfExists(CMS);
      console.log("Dropped CMS Table");
    }

    // Check if table already exists
    const tableExists = await DB.schema.hasTable(CMS);
    if (tableExists && !dropFirst) {
      console.log("✓ CMS Table already exists, skipping creation");
      return;
    }

    console.log("Creating CMS Table");
    await DB.schema.createTable(CMS, (table) => {
      table.increments("cms_id").primary();

      // Section Type - determines which fields are relevant
      table
        .string("section_type", 50)
        .notNullable()
        .comment(
          "hero, trusted_company, why_choose_us, featured_creator, success_story, landing_faq, social_media"
        );

      // Hero Section Fields (title, subtitle, background_image)
      table.string("title", 255).nullable(); // Hero: title, Why Choose Us: question
      table.text("subtitle").nullable(); // Hero: subtitle
      table.text("background_image").nullable(); // Hero: background

      // Trusted Companies Fields (company_name, logo_url, sort_order)
      table.string("company_name", 255).nullable(); // Trusted Companies: name
      table.text("logo_url").nullable(); // Trusted Companies: logo

      // Why Choose Us Fields (question in title, answer in description, sort_order only)
      table.text("description").nullable(); // Why Choose Us: answer / Description

      // Why Choose Us - 5 Points Structure (title in title field, points below)
      table.string("point_1", 255).nullable(); // Why Choose Us: Point 1 title
      table.text("point_1_description").nullable(); // Why Choose Us: Point 1 description
      table.string("point_2", 255).nullable(); // Why Choose Us: Point 2 title
      table.text("point_2_description").nullable(); // Why Choose Us: Point 2 description
      table.string("point_3", 255).nullable(); // Why Choose Us: Point 3 title
      table.text("point_3_description").nullable(); // Why Choose Us: Point 3 description
      table.string("point_4", 255).nullable(); // Why Choose Us: Point 4 title
      table.text("point_4_description").nullable(); // Why Choose Us: Point 4 description
      table.string("point_5", 255).nullable(); // Why Choose Us: Point 5 title
      table.text("point_5_description").nullable(); // Why Choose Us: Point 5 description

      // Featured Creators Fields (name, bio, sort_order)
      table.string("name", 255).nullable(); // Featured Creators: name
      table.text("bio").nullable(); // Featured Creators: bio

      // Success Stories Fields (client_name, client_title, testimonial, rating, sort_order)
      table.string("client_name", 255).nullable(); // Success Stories: client name
      table.string("client_title", 255).nullable(); // Success Stories: client title
      table.text("testimonial").nullable(); // Success Stories: testimonial
      table.integer("rating").nullable(); // Success Stories: rating (1-5)

      // Landing FAQs Fields (question, answer, sort_order)
      table.text("question").nullable(); // Landing FAQs: question
      table.text("answer").nullable(); // Landing FAQs: answer

      // Social Media Links (social_media section type - no sort_order needed)
      table.string("social_whatsapp", 255).nullable(); // Social Media: WhatsApp
      table.string("social_linkedin", 255).nullable(); // Social Media: LinkedIn
      table.string("social_google", 255).nullable(); // Social Media: Google
      table.string("social_instagram", 255).nullable(); // Social Media: Instagram

      // Status & Ordering (Common for ALL sections)
      table.boolean("is_active").defaultTo(true);
      table.integer("sort_order").defaultTo(0); // Controls sequence for all sections

      // Audit Fields
      table.integer("created_by").notNullable();
      table.timestamp("created_at").defaultTo(DB.fn.now());
      table.timestamp("updated_at").defaultTo(DB.fn.now());
      table.integer("updated_by").nullable();
      table.boolean("is_deleted").defaultTo(false);
      table.integer("deleted_by").nullable();
      table.timestamp("deleted_at").nullable();

      // Indexes for better query performance
      table.index("section_type");
      table.index(["section_type", "is_active", "is_deleted"]);
      table.index("sort_order");
    });

    console.log("✓ CMS Table Created Successfully");

    // Create update_timestamp function if it doesn't exist
    console.log("Creating update_timestamp function...");
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
      console.log("✓ update_timestamp function created/updated");
    } catch (fnError) {
      console.log(
        "ℹ update_timestamp function might already exist, continuing..."
      );
    }

    console.log("Creating Triggers");
    // Drop existing trigger first
    await DB.raw(`DROP TRIGGER IF EXISTS update_timestamp ON ${CMS};`);

    await DB.raw(`
          CREATE TRIGGER update_timestamp
          BEFORE UPDATE
          ON ${CMS}
          FOR EACH ROW
          EXECUTE FUNCTION update_timestamp();
        `);
    console.log("✓ Finished Creating Triggers");
  } catch (error) {
    console.error("Migration failed for cms:", error);
    throw error;
  }
};

// Version: 3.0.0 - Simplified CMS table with only required fields for each content type
// Section Types:
// - 'hero' - Hero section with title, subtitle, background_image
// - 'trusted_company' - Company name, logo, sort_order
// - 'why_choose_us' - Question (title field), answer (description field), sort_order
// - 'featured_creator' - Name, bio, sort_order
// - 'success_story' - Client name, title, testimonial, rating, sort_order
// - 'landing_faq' - Question, answer, sort_order
// - 'social_media' - WhatsApp, LinkedIn, Google, Instagram URLs
