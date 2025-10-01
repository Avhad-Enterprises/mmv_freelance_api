#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';
import DB from '../database/index.schema';

const SCHEMA_MIGRATIONS_TABLE = 'schema_migrations';
const DATABASE_DIR = path.join(__dirname, '../database');

// Schema dependency order (tables that depend on others should come after)
const MIGRATION_ORDER = [
  // Independent lookup tables first
  'country.schema.ts',
  'states.schema.ts', 
  'city.schema.ts',
  'skill.schema.ts',
  'niches.schema.ts',
  'category.schema.ts',
  'tags.schema.ts',
  
  // Core tables
  'users.schema.ts',
  'role.schema.ts',
  'permission.schema.ts',
  
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
  'analytics_setting.schema.ts',
  'SEO.schema.ts',
  'robotstxt.schema.ts',
  'document_verification.schema.ts',
  'subscribed_emails.schema.ts',
  'userinvitations.schema.ts',
  'admin_invites.schema.ts',
  'application.schema.ts',
  'report_system.schema.ts',
  'report_templates.schema.ts',
  'reports_schedules.schema.ts',
  'transactions.schema.ts', // Move transactions after projects are created
  
  // Log/audit tables last  
  'visitor_logs.schema.ts',
  'emailog.schema.ts'
];

// Ensure schema migrations table exists
const ensureSchemaMigrationsTable = async () => {
  const exists = await DB.schema.hasTable(SCHEMA_MIGRATIONS_TABLE);
  if (!exists) {
    await DB.schema.createTable(SCHEMA_MIGRATIONS_TABLE, (table) => {
      table.increments('id').primary();
      table.string('schema_name').notNullable().unique();
      table.string('version').notNullable();
      table.timestamp('migrated_at').defaultTo(DB.fn.now());
    });
    console.log('📋 Created schema_migrations table');
  }
};

// Get migrated schemas from database
const getMigratedSchemas = async (): Promise<Set<string>> => {
  const migrated = await DB(SCHEMA_MIGRATIONS_TABLE).select('schema_name');
  return new Set(migrated.map(row => row.schema_name));
};

// Record schema migration
const recordMigration = async (schemaName: string, version: string) => {
  await DB(SCHEMA_MIGRATIONS_TABLE).insert({
    schema_name: schemaName,
    version: version
  });
};

// Get schema version from file content
const getSchemaVersion = (filePath: string): string => {
  const content = fs.readFileSync(filePath, 'utf8');
  const versionMatch = content.match(/\/\/ Version: (.+)/);
  return versionMatch ? versionMatch[1] : new Date().toISOString();
};

// Main migration function
const migrateAll = async (dropFirst = false) => {
  try {
    console.log('🚀 Starting schema-based migration...');
    
    await ensureSchemaMigrationsTable();
    const migratedSchemas = await getMigratedSchemas();
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const schemaFile of MIGRATION_ORDER) {
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
        
        // Record migration if not dropping
        if (!dropFirst) {
          const version = getSchemaVersion(schemaPath);
          await recordMigration(schemaName, version);
        }
        
        console.log(`✅ Successfully migrated ${schemaName}`);
        migratedCount++;
        
      } catch (error) {
        console.error(`❌ Error migrating ${schemaName}:`, error);
        throw error;
      }
    }
    
    console.log('\n🎉 Migration completed!');
    console.log(`📊 Summary: ${migratedCount} migrated, ${skippedCount} skipped`);
    
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

// Execute migration
migrateAll(dropFirst).catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});