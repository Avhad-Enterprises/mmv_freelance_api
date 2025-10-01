#!/usr/bin/env ts-node

/**
 * Phase 1 Migration: Add new freelancer fields to users table
 * 
 * This migration adds the following fields:
 * - superpowers (jsonb) - Array of freelancer superpowers
 * - skill_tags (jsonb) - Array of skill tags  
 * - short_description (text) - Freelancer profile description
 * - Updates portfolio_links from string to jsonb
 */

import DB from '../database/index.schema';

const USERS_TABLE = 'users';

const runPhase1Migration = async () => {
  try {
    console.log('🚀 Starting Phase 1 Migration: Adding new freelancer fields to users table');
    
    // Check if table exists
    const tableExists = await DB.schema.hasTable(USERS_TABLE);
    if (!tableExists) {
      console.log(`❌ Table ${USERS_TABLE} does not exist. Please run the main schema migration first.`);
      process.exit(1);
    }

    // Check existing columns
    const columns = await DB(USERS_TABLE).columnInfo();
    console.log('📋 Checking existing columns...');

    // 1. Add superpowers column if it doesn't exist
    if (!columns.superpowers) {
      console.log('➕ Adding superpowers column...');
      await DB.schema.alterTable(USERS_TABLE, (table) => {
        table.jsonb('superpowers').nullable();
      });
      console.log('✅ Added superpowers column');
    } else {
      console.log('⏩ superpowers column already exists');
    }

    // 2. Add skill_tags column if it doesn't exist
    if (!columns.skill_tags) {
      console.log('➕ Adding skill_tags column...');
      await DB.schema.alterTable(USERS_TABLE, (table) => {
        table.jsonb('skill_tags').nullable();
      });
      console.log('✅ Added skill_tags column');
    } else {
      console.log('⏩ skill_tags column already exists');
    }

    // 3. Add short_description column if it doesn't exist
    if (!columns.short_description) {
      console.log('➕ Adding short_description column...');
      await DB.schema.alterTable(USERS_TABLE, (table) => {
        table.text('short_description').nullable();
      });
      console.log('✅ Added short_description column');
    } else {
      console.log('⏩ short_description column already exists');
    }

    // 4. Check portfolio_links column type
    if (columns.portfolio_links) {
      console.log('🔄 Checking portfolio_links column type...');
      
      // Check if it's currently string type (need to convert to jsonb)
      const result = await DB.raw(`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = ? AND column_name = ?
      `, [USERS_TABLE, 'portfolio_links']);
      
      const currentType = result.rows[0]?.data_type;
      console.log(`Current portfolio_links type: ${currentType}`);
      
      if (currentType === 'character varying' || currentType === 'text') {
        console.log('🔄 Converting portfolio_links from string to jsonb...');
        
        // First, update existing string values to valid JSON arrays
        await DB.raw(`
          UPDATE ${USERS_TABLE} 
          SET portfolio_links = 
            CASE 
              WHEN portfolio_links IS NULL THEN NULL
              WHEN portfolio_links = '' THEN NULL
              ELSE json_build_array(portfolio_links)::jsonb
            END
          WHERE portfolio_links IS NOT NULL
        `);
        
        // Then alter the column type
        await DB.raw(`
          ALTER TABLE ${USERS_TABLE} 
          ALTER COLUMN portfolio_links TYPE jsonb 
          USING 
            CASE 
              WHEN portfolio_links IS NULL THEN NULL
              ELSE portfolio_links::jsonb
            END
        `);
        
        console.log('✅ Converted portfolio_links to jsonb type');
      } else if (currentType === 'jsonb') {
        console.log('⏩ portfolio_links is already jsonb type');
      }
    } else {
      console.log('➕ Adding portfolio_links column as jsonb...');
      await DB.schema.alterTable(USERS_TABLE, (table) => {
        table.jsonb('portfolio_links').nullable();
      });
      console.log('✅ Added portfolio_links column');
    }

    // 5. Record the migration
    console.log('📝 Recording migration...');
    const SCHEMA_MIGRATIONS_TABLE = 'schema_migrations';
    
    // Ensure schema migrations table exists
    const migrationsTableExists = await DB.schema.hasTable(SCHEMA_MIGRATIONS_TABLE);
    if (!migrationsTableExists) {
      await DB.schema.createTable(SCHEMA_MIGRATIONS_TABLE, (table) => {
        table.increments('id').primary();
        table.string('schema_name').notNullable();
        table.string('version').notNullable();
        table.string('description').nullable();
        table.timestamp('migrated_at').defaultTo(DB.fn.now());
      });
    }
    
    // Record this migration
    const existing = await DB(SCHEMA_MIGRATIONS_TABLE)
      .where('schema_name', 'users_phase1')
      .first();
      
    if (existing) {
      await DB(SCHEMA_MIGRATIONS_TABLE)
        .where('schema_name', 'users_phase1')
        .update({
          version: '1.1.0',
          migrated_at: DB.fn.now()
        });
    } else {
      await DB(SCHEMA_MIGRATIONS_TABLE).insert({
        schema_name: 'users_phase1',
        version: '1.1.0'
      });
    }

    console.log('✅ Phase 1 Migration completed successfully!');
    console.log('');
    console.log('📊 Migration Summary:');
    console.log('  ➕ superpowers (jsonb) - Array of freelancer superpowers');
    console.log('  ➕ skill_tags (jsonb) - Array of skill tags');
    console.log('  ➕ short_description (text) - Freelancer profile description');
    console.log('  🔄 portfolio_links (string → jsonb) - Array of portfolio URLs');
    console.log('');
    console.log('🎉 Database is now ready for the updated registration API!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await DB.destroy();
  }
};

// Run the migration
runPhase1Migration();