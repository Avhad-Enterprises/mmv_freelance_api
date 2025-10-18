#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';
import DB from '../database/index';

const SCHEMA_MIGRATIONS_TABLE = 'schema_migrations';
const DATABASE_DIR = path.join(__dirname, '../database');

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

// Record schema migration
const recordMigration = async (schemaName: string, version: string) => {
  // Check if already exists
  const existing = await DB(SCHEMA_MIGRATIONS_TABLE)
    .where('schema_name', schemaName)
    .first();
    
  if (existing) {
    // Update existing record
    await DB(SCHEMA_MIGRATIONS_TABLE)
      .where('schema_name', schemaName)
      .update({
        version: version,
        migrated_at: DB.fn.now()
      });
  } else {
    // Insert new record
    await DB(SCHEMA_MIGRATIONS_TABLE).insert({
      schema_name: schemaName,
      version: version
    });
  }
};

// Get schema version from file content
const getSchemaVersion = (filePath: string): string => {
  const content = fs.readFileSync(filePath, 'utf8');
  const versionMatch = content.match(/\/\/ Version: (.+)/);
  return versionMatch ? versionMatch[1] : new Date().toISOString();
};

// Main function to migrate a single schema
const migrateSchema = async (schemaName: string, dropFirst = false) => {
  try {
    console.log(`🚀 Migrating schema: ${schemaName}`);
    
    await ensureSchemaMigrationsTable();
    
    const schemaFile = `${schemaName}.schema.ts`;
    const schemaPath = path.join(DATABASE_DIR, schemaFile);
    
    if (!fs.existsSync(schemaPath)) {
      console.error(`❌ Schema file not found: ${schemaFile}`);
      process.exit(1);
    }
    
    try {
      // Import the schema module
      const schemaModule = await import(schemaPath);
      
      if (typeof schemaModule.migrate === 'function') {
        await schemaModule.migrate(dropFirst);
      } else if (typeof schemaModule.seed === 'function') {
        // Fallback to seed function for backward compatibility
        await schemaModule.seed(dropFirst);
      } else {
        console.error(`❌ No migrate or seed function found in ${schemaFile}`);
        process.exit(1);
      }
      
      // Record migration if not dropping
      if (!dropFirst) {
        const version = getSchemaVersion(schemaPath);
        await recordMigration(schemaName, version);
      }
      
      console.log(`✅ Successfully migrated ${schemaName}`);
      
    } catch (error) {
      console.error(`❌ Error migrating ${schemaName}:`, error);
      throw error;
    }
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  } finally {
    await DB.destroy();
  }
};

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
📖 Usage: npm run migrate:schema -- <schema_name> [--drop]

Examples:
  npm run migrate:schema -- users
  npm run migrate:schema -- users --drop
  npm run migrate:schema -- category
  
Available schemas:
${fs.readdirSync(DATABASE_DIR)
  .filter(file => file.endsWith('.schema.ts'))
  .map(file => `  - ${file.replace('.schema.ts', '')}`)
  .join('\n')}
  `);
  process.exit(0);
}

const schemaName = args[0];
const dropFirst = args.includes('--drop') || args.includes('-d');

// Validate schema name
if (!schemaName.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
  console.error('❌ Invalid schema name. Use only letters, numbers, and underscores.');
  process.exit(1);
}

// Execute migration
migrateSchema(schemaName, dropFirst).catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});