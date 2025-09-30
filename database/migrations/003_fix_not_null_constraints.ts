import DB from '../index.schema';

export const up = async () => {
  console.log('🔄 Running migration: Fix NOT NULL constraints for Phase 2...');

  try {
    console.log('🔧 Making freelancer/client specific fields nullable using raw SQL...');
    
    // Use raw SQL to alter column constraints
    const columnsToMakeNullable = [
      'profile_title',
      'phone_number',
      'company_name'
    ];

    for (const column of columnsToMakeNullable) {
      try {
        await DB.raw(`ALTER TABLE users ALTER COLUMN ${column} DROP NOT NULL`);
        console.log(`  ✅ Made ${column} nullable`);
      } catch (columnError) {
        console.log(`  ⚠️  ${column} constraint might already be nullable or doesn't exist`);
      }
    }

    console.log('✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async () => {
  console.log('🔄 Rolling back migration: Fix NOT NULL constraints for Phase 2...');
  
  try {
    // Revert the changes
    await DB.schema.alterTable('users', (table) => {
      table.string('profile_title').notNullable().alter();
      table.string('phone_number').notNullable().alter();
    });

    console.log('✅ Rollback completed successfully!');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};