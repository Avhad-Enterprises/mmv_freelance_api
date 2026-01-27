// To migrate this schema: npm run migrate:schema -- cms [--drop]
//
// Migration Commands:
// 1. Standard Migration: npm run migrate:schema -- cms
//    - Creates/updates the cms table while preserving existing data
//    - Adds missing columns if table exists
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

    const tableExists = await DB.schema.hasTable(CMS);
    if (tableExists && !dropFirst) {
      console.log("✓ CMS Table already exists, checking for schema updates...");

      // FIX: Ensure title column is nullable (addresses persistent NOT NULL constraint issues)
      await DB.schema.alterTable(CMS, (table) => {
        table.string("title", 255).nullable().alter();
      });
      console.log("✓ Updated 'title' column to be nullable");

      const columnsToAdd = [
        { name: "profile_image", type: "text" },
        { name: "skills", type: "jsonb" },
        { name: "stats", type: "jsonb" },
        { name: "portfolio_url", type: "string", length: 2048 },
        { name: "social_twitter", type: "string", length: 255 },
        { name: "client_image", type: "text" },
        { name: "company", type: "string", length: 255 },
        { name: "company_logo", type: "text" },
        { name: "project_type", type: "string", length: 255 },
        { name: "category", type: "string", length: 255 },
        { name: "tags", type: "jsonb" },
        { name: "user_id", type: "integer" },
      ];

      for (const col of columnsToAdd) {
        const hasColumn = await DB.schema.hasColumn(CMS, col.name);
        if (!hasColumn) {
          console.log(`Adding missing column: ${col.name}`);
          await DB.schema.table(CMS, (table) => {
            if (col.type === "jsonb") table.jsonb(col.name).nullable();
            else if (col.type === "text") table.text(col.name).nullable();
            else if (col.type === "string")
              table.string(col.name, col.length as number).nullable();
            else if (col.type === "integer") table.integer(col.name).nullable();
          });
        }
      }
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

      // Hero Section Fields (title, subtitle, left/right images)
      table.string("title", 255).nullable(); // Hero: title, Why Choose Us: question, Featured Creator: title
      table.text("subtitle").nullable(); // Hero: subtitle
      table.text("hero_left_image").nullable(); // Hero: left side illustration (SVG/PNG URL)
      table.text("hero_right_image").nullable(); // Hero: right side illustration (SVG/PNG URL)
      table.text("background_image").nullable(); // Hero: optional background (deprecated, use left/right)

      // Trusted Companies Fields
      table.string("company_name", 255).nullable();
      table.text("logo_url").nullable();
      // description is shared below

      // Why Choose Us Fields
      table.text("description").nullable(); // Why Choose Us: answer, Trusted Company: description

      // Why Choose Us - 5 Points Structure
      table.string("point_1", 255).nullable();
      table.text("point_1_description").nullable();
      table.string("point_2", 255).nullable();
      table.text("point_2_description").nullable();
      table.string("point_3", 255).nullable();
      table.text("point_3_description").nullable();
      table.string("point_4", 255).nullable();
      table.text("point_4_description").nullable();
      table.string("point_5", 255).nullable();
      table.text("point_5_description").nullable();

      // Featured Creators Fields
      table.string("name", 255).nullable();
      table.text("bio").nullable();
      table.text("profile_image").nullable();
      table.jsonb("skills").nullable();
      table.jsonb("stats").nullable();
      table.string("portfolio_url", 2048).nullable();
      table.integer("user_id").nullable(); // Link to users table

      // Success Stories Fields
      table.string("client_name", 255).nullable();
      table.string("client_title", 255).nullable();
      table.text("testimonial").nullable();
      table.integer("rating").nullable();
      table.text("client_image").nullable();
      table.string("company", 255).nullable();
      table.text("company_logo").nullable();
      table.string("project_type", 255).nullable();

      // Landing FAQs Fields
      table.text("question").nullable();
      table.text("answer").nullable();
      table.string("category", 255).nullable();
      table.jsonb("tags").nullable();

      // Social Media Links
      table.string("social_whatsapp", 255).nullable();
      table.string("social_linkedin", 255).nullable();
      table.string("social_google", 255).nullable();
      table.string("social_instagram", 255).nullable();
      table.string("social_twitter", 255).nullable();

      // Status & Ordering (Common for ALL sections)
      table.boolean("is_active").defaultTo(true);
      table.integer("sort_order").defaultTo(0);

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
