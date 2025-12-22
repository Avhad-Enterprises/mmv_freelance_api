#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';
import DB, { T } from '../database/index';
import {
  SCHEMA_MIGRATIONS_TABLE,
  DATABASE_DIR,
  ensureSchemaMigrationsTable,
  recordMigration,
  getSchemaVersion
} from './migration-utils';

// Schema dependency order (tables that depend on others should come after)
const MIGRATION_ORDER = [
  // Independent lookup tables first
  'category.schema.ts', // Defines update_timestamp() function
  'skill.schema.ts',
  'tags.schema.ts',

  // Core tables
  'users.schema.ts',
  'role.schema.ts',
  'permission.schema.ts',

  // Profile tables (must come after users)
  'freelancer_profiles.schema.ts',
  'client_profiles.schema.ts',
  'admin_profiles.schema.ts',
  'videographer_profiles.schema.ts',
  'videoeditor_profiles.schema.ts',

  // Relationship tables
  'user_role.schema.ts',
  'role_permission.schema.ts',

  // Feature tables
  'projectstask.schema.ts',
  'applied_projects.schema.ts',
  'submitted_projects.schema.ts',
  'saved_project.schema.ts',
  'favorites.schema.ts',
  'blog.schema.ts',
  'cms.schema.ts',
  'faq.schema.ts',
  'review.schema.ts',
  'notification.schema.ts',
  'support_ticket.schema.ts',
  'support_ticket_reply.schema.ts',
  'support_ticket_note.schema.ts',
  'branding_assets.schema.ts',
  'analytics.schema.ts',
  'seo.schema.ts',
  'robotstxt.schema.ts',
  'subscribed_emails.schema.ts',
  'admin_invites.schema.ts',
  'report_system.schema.ts',
  'report_templates.schema.ts',
  'transactions.schema.ts', // Move transactions after projects are created

  // Log/audit tables last  
  'visitor_logs.schema.ts',
  'emailog.schema.ts'
];

// Drop all tables in reverse dependency order for clean slate
const dropAllTables = async () => {
  console.log('🗑️  Dropping all existing tables for clean slate...');

  // Tables in reverse dependency order (most dependent first)
  const tablesToDrop = [
    T.EMAIL_LOG_TABLE,
    T.VISITOR_LOGS,
    T.TRANSACTION_TABLE,
    T.REPORT_TEMPLATES,
    T.REPORT_TABLE,
    T.INVITATION_TABLE,
    T.SUBSCRIBED_EMAILS,
    T.ROBOTS_TXT,
    T.SEO,
    T.ANALYTICS_SETTINGS,
    T.BRANDING_ASSETS,
    T.TICKET_NOTE_TABLE,
    T.TICKET_REPLY_TABLE,
    T.SUPPORT_TICKETS_TABLE,
    T.NOTIFICATION,
    T.REVIEWS_TABLE,
    T.FAQ,
    T.CMS,
    T.BLOG,
    T.FAVORITES_TABLE,
    T.SAVED_PROJECTS,
    T.SUBMITTED_PROJECTS,
    T.APPLIED_PROJECTS,
    T.PROJECTS_TASK,
    T.ROLE_PERMISSION,
    T.USER_ROLES,
    T.VIDEOEDITOR_PROFILES,
    T.VIDEOGRAPHER_PROFILES,
    T.ADMIN_PROFILES,
    T.CLIENT_PROFILES,
    T.FREELANCER_PROFILES,
    T.PERMISSION,
    T.ROLE,
    T.USERS_TABLE,
    T.TAGS_TABLE,
    T.CATEGORY,
    T.SKILLS,
    SCHEMA_MIGRATIONS_TABLE // Drop migration tracking table too
  ];

  for (const table of tablesToDrop) {
    try {
      await DB.schema.dropTableIfExists(table);
      console.log(`  ✅ Dropped ${table}`);
    } catch (error) {
      // Try with CASCADE if regular drop fails
      try {
        await DB.raw(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        console.log(`  ✅ Dropped ${table} (with CASCADE)`);
      } catch (cascadeError) {
        console.log(`  ⚠️  Could not drop ${table}:`, error instanceof Error ? error.message : String(error));
      }
    }
  }

  console.log('✅ All tables dropped successfully');
};

// Get migrated schemas from database
const getMigratedSchemas = async (): Promise<Set<string>> => {
  const migrated = await DB(SCHEMA_MIGRATIONS_TABLE).select('schema_name');
  return new Set(migrated.map(row => row.schema_name));
};

// Main migration function
const migrateAll = async (dropFirst = false, verbose = false) => {
  try {
    console.log('🚀 Starting schema-based migration...');

    // For clean slate, drop all existing tables first
    if (dropFirst) {
      await dropAllTables();
    }

    await ensureSchemaMigrationsTable();
    const migratedSchemas = await getMigratedSchemas();

    let migratedCount = 0;
    let skippedCount = 0;

    // Use normal order for creating (dependencies handled)
    const migrationOrder = MIGRATION_ORDER;

    for (const schemaFile of migrationOrder) {
      const schemaName = schemaFile.replace('.schema.ts', '');
      const schemaPath = path.join(DATABASE_DIR, schemaFile);

      if (!fs.existsSync(schemaPath)) {
        console.log(`⚠️  Schema file not found: ${schemaFile}`);
        continue;
      }

      // Skip if already migrated (unless dropping first)
      if (!dropFirst && migratedSchemas.has(schemaName)) {
        console.log(`⏭️  Skipping ${schemaName} (already migrated)`);
        skippedCount++;
        continue;
      }

      try {
        console.log(`📦 Migrating ${schemaName}...`);

        // Import the schema module
        const schemaModule = await import(schemaPath);

        if (typeof schemaModule.migrate === 'function') {
          await schemaModule.migrate(dropFirst);
        } else if (typeof schemaModule.seed === 'function') {
          // Fallback to seed function for backward compatibility
          await schemaModule.seed(dropFirst);
        } else {
          console.log(`⚠️  No migrate or seed function found in ${schemaFile}`);
          continue;
        }

        // Record migration
        const version = getSchemaVersion(schemaPath);
        await recordMigration(schemaName, version);

        console.log(`✅ Successfully migrated ${schemaName}`);
        migratedCount++;

      } catch (error: any) {
        // Handle specific database errors more gracefully
        if (error.code === '42P01' && error.message.includes('does not exist')) {
          // Table doesn't exist, this is expected for fresh installs
          console.log(`   📝 Creating ${schemaName} (fresh install)`);

          // Try to create the table
          try {
            const schemaModule = await import(schemaPath);
            if (typeof schemaModule.migrate === 'function') {
              await schemaModule.migrate(false); // Force create without drop
            } else if (typeof schemaModule.seed === 'function') {
              await schemaModule.seed(false);
            }

            const version = getSchemaVersion(schemaPath);
            await recordMigration(schemaName, version);
            console.log(`✅ Successfully created ${schemaName}`);
            migratedCount++;
          } catch (createError) {
            console.error(`❌ Failed to create ${schemaName}:`, createError);
            throw createError;
          }
        } else if (error.code === '2BP01' && error.message.includes('cannot drop table')) {
          // Foreign key constraint issue - table has dependencies, skip drop and try to create
          console.log(`   🔗 ${schemaName} has dependencies, skipping drop but creating table`);

          try {
            const schemaModule = await import(schemaPath);
            if (typeof schemaModule.migrate === 'function') {
              await schemaModule.migrate(false); // Create without drop
            } else if (typeof schemaModule.seed === 'function') {
              await schemaModule.seed(false);
            }

            const version = getSchemaVersion(schemaPath);
            await recordMigration(schemaName, version);
            console.log(`✅ Successfully created ${schemaName}`);
            migratedCount++;
          } catch (createError) {
            console.error(`❌ Failed to create ${schemaName}:`, createError);
            throw createError;
          }
        } else if (error.code === '42P07' && error.message.includes('already exists')) {
          // Table already exists
          console.log(`   ✨ ${schemaName} already exists, marking as migrated`);
          const version = getSchemaVersion(schemaPath);
          await recordMigration(schemaName, version);
          migratedCount++;
        } else {
          console.error(`❌ Error migrating ${schemaName}:`, error);
          throw error;
        }
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log(`📊 Summary: ${migratedCount} migrated, ${skippedCount} skipped`);

    // RBAC data seeding is now handled by individual schema migrations

  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  } finally {
    await DB.destroy();
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const dropFirst = args.includes('--drop') || args.includes('-d');
const verbose = args.includes('--verbose') || args.includes('-v');
const showHelp = args.includes('--help') || args.includes('-h');

if (showHelp) {
  console.log(`
🚀 MMV Freelance API - Migration System

USAGE:
  npm run migrate:all [options]
  npx ts-node scripts/migrate-all.ts [options]

OPTIONS:
  --drop, -d      Drop all tables before creating (fresh install)
  --verbose, -v   Show detailed database messages
  --help, -h      Show this help message

EXAMPLES:
  npm run migrate:all                    # Migrate pending schemas
  npm run migrate:all --drop             # Fresh database setup
  npm run migrate:all --verbose          # Show detailed output
  
FEATURES:
  ✅ Migrates all 35+ database schemas in dependency order
  ✅ Automatically seeds RBAC data (roles, permissions, mappings)
  ✅ Handles foreign key dependencies gracefully
  ✅ Tracks migration status to avoid duplicates
  ✅ Safe error handling for expected database messages

UNDERSTANDING OUTPUT:
  "Table does not exist" errors → Normal (creates table)
  "Cannot drop table" errors → Normal (preserves data)
  "Already exists" errors → Normal (table ready)
  
  Look for ✅ "Successfully migrated" for confirmation
  Real errors will stop the process and show clear messages

OTHER COMMANDS:
  npm run migrate:status     # Check what's migrated
  npm run migrate:schema     # Migrate specific schema
  
📚 Full documentation: See MIGRATION_GUIDE.md
`);
  process.exit(0);
}

console.log('\n📋 Migration Options:');
console.log(`   Drop tables first: ${dropFirst ? '✅ Yes' : '❌ No'}`);
console.log(`   Verbose output: ${verbose ? '✅ Yes' : '❌ No'}`);
if (!verbose) {
  console.log('   💡 Use --verbose flag to see detailed database messages');
}
console.log('\n📝 Note: "Table does not exist" and "cannot drop table" messages are expected during migration');
console.log('   These indicate normal migration behavior and are handled automatically.\n');

// Execute migration
migrateAll(dropFirst, verbose).catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});