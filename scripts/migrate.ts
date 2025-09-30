#!/usr/bin/env ts-node

import path from 'path';
import fs from 'fs';
import DB from '../database/index.schema';

const MIGRATIONS_DIR = path.join(__dirname, '../database/migrations');
const MIGRATIONS_TABLE = 'migrations';

// Ensure migrations table exists
const ensureMigrationsTable = async () => {
  const exists = await DB.schema.hasTable(MIGRATIONS_TABLE);
  if (!exists) {
    await DB.schema.createTable(MIGRATIONS_TABLE, (table) => {
      table.increments('id').primary();
      table.string('name').notNullable().unique();
      table.timestamp('executed_at').defaultTo(DB.fn.now());
    });
    console.log('📋 Created migrations table');
  }
};

// Get list of migration files
const getMigrationFiles = (): string[] => {
  return fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
    .sort();
};

// Get executed migrations from database
const getExecutedMigrations = async (): Promise<string[]> => {
  const migrations = await DB(MIGRATIONS_TABLE).select('name').orderBy('id');
  return migrations.map(m => m.name);
};

// Run migrations
const runMigrations = async () => {
  console.log('🚀 Starting migration process...\n');
  
  try {
    await ensureMigrationsTable();
    
    const migrationFiles = getMigrationFiles();
    const executedMigrations = await getExecutedMigrations();
    
    const pendingMigrations = migrationFiles.filter(
      file => !executedMigrations.includes(file)
    );
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations found');
      return;
    }
    
    console.log(`📦 Found ${pendingMigrations.length} pending migration(s):\n`);
    
    for (const migrationFile of pendingMigrations) {
      console.log(`🔄 Running migration: ${migrationFile}`);
      
      const migrationPath = path.join(MIGRATIONS_DIR, migrationFile);
      const migration = await import(migrationPath);
      
      if (typeof migration.up !== 'function') {
        throw new Error(`Migration ${migrationFile} must export an 'up' function`);
      }
      
      // Run the migration
      await migration.up();
      
      // Record the migration as executed
      await DB(MIGRATIONS_TABLE).insert({
        name: migrationFile
      });
      
      console.log(`✅ Completed migration: ${migrationFile}\n`);
    }
    
    console.log('🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await DB.destroy();
  }
};

// Rollback last migration
const rollbackMigration = async () => {
  console.log('🔄 Starting rollback process...\n');
  
  try {
    await ensureMigrationsTable();
    
    const lastMigration = await DB(MIGRATIONS_TABLE)
      .orderBy('id', 'desc')
      .first();
    
    if (!lastMigration) {
      console.log('ℹ️  No migrations to rollback');
      return;
    }
    
    console.log(`🔄 Rolling back migration: ${lastMigration.name}`);
    
    const migrationPath = path.join(MIGRATIONS_DIR, lastMigration.name);
    const migration = await import(migrationPath);
    
    if (typeof migration.down !== 'function') {
      throw new Error(`Migration ${lastMigration.name} must export a 'down' function for rollback`);
    }
    
    // Run the rollback
    await migration.down();
    
    // Remove the migration record
    await DB(MIGRATIONS_TABLE).where('id', lastMigration.id).del();
    
    console.log(`✅ Rolled back migration: ${lastMigration.name}`);
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    process.exit(1);
  } finally {
    await DB.destroy();
  }
};

// Check migration status
const checkStatus = async () => {
  console.log('📋 Migration Status:\n');
  
  try {
    await ensureMigrationsTable();
    
    const migrationFiles = getMigrationFiles();
    const executedMigrations = await getExecutedMigrations();
    
    console.log('Available migrations:');
    migrationFiles.forEach(file => {
      const status = executedMigrations.includes(file) ? '✅ Executed' : '⏳ Pending';
      console.log(`  ${status} - ${file}`);
    });
    
    const pendingCount = migrationFiles.filter(file => !executedMigrations.includes(file)).length;
    console.log(`\n📊 Summary: ${executedMigrations.length} executed, ${pendingCount} pending`);
    
  } catch (error) {
    console.error('❌ Status check failed:', error);
    process.exit(1);
  } finally {
    await DB.destroy();
  }
};

// CLI interface
const command = process.argv[2];

switch (command) {
  case 'up':
  case 'migrate':
    runMigrations();
    break;
  case 'down':
  case 'rollback':
    rollbackMigration();
    break;
  case 'status':
    checkStatus();
    break;
  default:
    console.log(`
🔧 MMV Migration Tool

Usage:
  npm run db:migrate        - Run pending migrations
  npm run db:rollback       - Rollback last migration  
  npm run db:status         - Check migration status

Commands:
  up, migrate              - Run all pending migrations
  down, rollback           - Rollback the last migration
  status                   - Show migration status
`);
    break;
}