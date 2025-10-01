#!/usr/bin/env ts-node

import DB from '../database/index.schema';

const resetMigrations = async () => {
  try {
    console.log('🔄 Resetting migration tracking...');
    
    // Drop the schema_migrations table to reset all tracking
    await DB.schema.dropTableIfExists('schema_migrations');
    
    console.log('✅ Schema migrations table dropped - all migrations reset');
    console.log('💡 All schemas are now marked as "not migrated"');
    console.log('💡 You can now run: npm run migrate:all --drop');
    
  } catch (error) {
    console.error('❌ Error resetting migrations:', error);
    throw error;
  } finally {
    await DB.destroy();
  }
};

// Execute reset
resetMigrations().catch((error) => {
  console.error('Reset failed:', error);
  process.exit(1);
});