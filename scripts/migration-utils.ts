#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';
import DB from '../database/index';

export const SCHEMA_MIGRATIONS_TABLE = 'schema_migrations';
export const DATABASE_DIR = path.join(__dirname, '../database');

/**
 * Ensure schema migrations table exists
 */
export const ensureSchemaMigrationsTable = async () => {
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

/**
 * Record schema migration (insert only - for initial migrations)
 */
export const recordMigration = async (schemaName: string, version: string) => {
  await DB(SCHEMA_MIGRATIONS_TABLE).insert({
    schema_name: schemaName,
    version: version
  });
};

/**
 * Record or update schema migration (upsert - for re-migrations)
 */
export const recordOrUpdateMigration = async (schemaName: string, version: string) => {
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

/**
 * Get schema version from file content
 */
export const getSchemaVersion = (filePath: string): string => {
  const content = fs.readFileSync(filePath, 'utf8');
  const versionMatch = content.match(/\/\/ Version: (.+)/);
  return versionMatch ? versionMatch[1] : new Date().toISOString();
};