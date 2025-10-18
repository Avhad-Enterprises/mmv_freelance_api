#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';
import DB from '../database/index';

const SCHEMA_MIGRATIONS_TABLE = 'schema_migrations';
const DATABASE_DIR = path.join(__dirname, '../database');

// Show migration status
const showMigrationStatus = async () => {
  try {
    console.log('📊 Schema Migration Status\n');
    
    // Get all schema files
    const schemaFiles = fs.readdirSync(DATABASE_DIR)
      .filter(file => file.endsWith('.schema.ts'))
      .sort();
    
    // Check if migrations table exists
    const migrationsTableExists = await DB.schema.hasTable(SCHEMA_MIGRATIONS_TABLE);
    
    let migratedSchemas: any[] = [];
    if (migrationsTableExists) {
      // Get migrated schemas
      migratedSchemas = await DB(SCHEMA_MIGRATIONS_TABLE)
        .select('schema_name', 'version', 'migrated_at')
        .orderBy('migrated_at', 'desc');
    } else {
      console.log('ℹ️  Schema migrations table does not exist - all schemas shown as pending\n');
    }
    
    const migratedMap = new Map(
      migratedSchemas.map(row => [row.schema_name, row])
    );
    
    console.log('┌─────────────────────────┬────────────┬─────────────────────┬──────────────────────┐');
    console.log('│ Schema                  │ Status     │ Version             │ Migrated At          │');
    console.log('├─────────────────────────┼────────────┼─────────────────────┼──────────────────────┤');
    
    for (const file of schemaFiles) {
      const schemaName = file.replace('.schema.ts', '');
      const migrated = migratedMap.get(schemaName);
      
      const status = migrated ? '✅ Migrated' : '❌ Pending';
      const version = migrated ? migrated.version.substring(0, 19) : '-';
      const migratedAt = migrated 
        ? new Date(migrated.migrated_at).toLocaleString()
        : '-';
      
      console.log(
        `│ ${schemaName.padEnd(23)} │ ${status.padEnd(10)} │ ${version.padEnd(19)} │ ${migratedAt.padEnd(20)} │`
      );
    }
    
    console.log('└─────────────────────────┴────────────┴─────────────────────┴──────────────────────┘');
    
    const totalSchemas = schemaFiles.length;
    const migratedCount = migratedSchemas.length;
    const pendingCount = totalSchemas - migratedCount;
    
    console.log(`\n📈 Summary:`);
    console.log(`   Total schemas: ${totalSchemas}`);
    console.log(`   Migrated: ${migratedCount}`);
    console.log(`   Pending: ${pendingCount}`);
    
    if (pendingCount > 0) {
      console.log(`\n💡 To migrate all pending schemas: npm run migrate:all`);
      console.log(`💡 To migrate specific schema: npm run migrate:schema -- <schema_name>`);
    }
    
  } catch (error) {
    console.error('❌ Error checking migration status:', error);
    throw error;
  } finally {
    await DB.destroy();
  }
};

// Execute status check
showMigrationStatus().catch((error) => {
  console.error('Status check failed:', error);
  process.exit(1);
});