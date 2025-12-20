#!/usr/bin/env ts-node
/**
 * Add Currency Column Migration Script
 * Safely adds currency column to projects_task table in production
 *
 * Usage: ts-node scripts/add-currency-column.ts
 */

import DB from '../database/index';

const addCurrencyColumn = async () => {
  try {
    console.log('🔄 Checking if currency column exists in projects_task table...');

    // Check if column already exists
    const hasColumn = await DB.schema.hasColumn('projects_task', 'currency');

    if (hasColumn) {
      console.log('✅ Currency column already exists in projects_task table');
      return;
    }

    console.log('🔄 Adding currency column to projects_task table...');

    // Add the currency column with default value
    await DB.schema.alterTable('projects_task', table => {
      table.string('currency', 3).defaultTo('USD');
    });

    console.log('✅ Successfully added currency column to projects_task table');
    console.log('📝 Column details: VARCHAR(3) DEFAULT \'USD\'');

  } catch (error) {
    console.error('❌ Failed to add currency column:', error);
    throw error;
  }
};

// Run the migration
addCurrencyColumn()
  .then(() => {
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });