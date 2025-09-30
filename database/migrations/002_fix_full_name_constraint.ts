import DB from '../index.schema';

export const up = async () => {
  console.log('🔄 Running migration: Remove full_name constraint and update schema...');

  try {
    console.log('📋 Checking full_name column constraint...');
    
    const hasFullName = await DB.schema.hasColumn('users', 'full_name');
    
    if (hasFullName) {
      console.log('🔧 Modifying full_name column to be nullable...');
      
      // First, update any null first_name/last_name records to have a full_name
      await DB.raw(`
        UPDATE users 
        SET full_name = COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')
        WHERE full_name IS NULL AND (first_name IS NOT NULL OR last_name IS NOT NULL)
      `);

      // Make full_name nullable
      await DB.schema.alterTable('users', (table) => {
        table.string('full_name').nullable().alter();
      });
      
      console.log('✅ Made full_name column nullable');
    }

    // Also ensure first_name and last_name are not nullable since we're using them now
    await DB.schema.alterTable('users', (table) => {
      table.string('first_name').notNullable().alter();
      table.string('last_name').notNullable().alter();
    });

    console.log('✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async () => {
  console.log('🔄 Rolling back migration: Remove full_name constraint and update schema...');
  
  try {
    // Revert the changes
    await DB.schema.alterTable('users', (table) => {
      table.string('full_name').notNullable().alter();
      table.string('first_name').nullable().alter();
      table.string('last_name').nullable().alter();
    });

    console.log('✅ Rollback completed successfully!');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};