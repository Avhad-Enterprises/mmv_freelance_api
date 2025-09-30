import DB from '../index.schema';

export const up = async () => {
  console.log('🔄 Running migration: Frontend sync field alignment...');

  try {
    // Check if zip_code column already exists
    const hasZipCode = await DB.schema.hasColumn('users', 'zip_code');
    
    if (!hasZipCode) {
      console.log('📋 Adding zip_code field for freelancers...');
      await DB.schema.alterTable('users', table => {
        table.string('zip_code').nullable();
      });
      console.log('✅ Added zip_code field');
    } else {
      console.log('✅ zip_code field already exists');
    }

  } catch (error) {
    console.log('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async () => {
  console.log('🔄 Rolling back migration: Frontend sync field alignment...');
  
  try {
    const hasZipCode = await DB.schema.hasColumn('users', 'zip_code');
    
    if (hasZipCode) {
      await DB.schema.alterTable('users', table => {
        table.dropColumn('zip_code');
      });
      console.log('✅ Dropped zip_code field');
    }
  } catch (error) {
    console.log('❌ Rollback failed:', error);
    throw error;
  }
};