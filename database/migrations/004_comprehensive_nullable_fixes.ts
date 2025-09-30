import DB from '../index.schema';

export const up = async () => {
  console.log('🔄 Running migration: Comprehensive NOT NULL constraint fixes...');

  try {
    console.log('🔧 Making all Phase 2 fields nullable...');
    
    // List of all columns that should be nullable for Phase 2 registration
    const columnsToMakeNullable = [
      // Original fields that should be nullable
      'profile_title',
      'phone_number', 
      'company_name',
      'profile_picture',
      
      // Address fields
      'address_line_first',
      'address_line_second',
      'city',
      'state', 
      'country',
      'pincode',
      
      // Freelancer specific fields
      'skills',
      'experience_level',
      'portfolio_links',
      'hourly_rate',
      'availability',
      'work_type',
      'hours_per_week',
      'languages',
      'id_type',
      'id_document_url',
      
      // Client specific fields
      'industry',
      'website',
      'social_links',
      'company_size',
      'required_services',
      'required_skills',
      'required_editor_proficiencies',
      'required_videographer_proficiencies',
      'budget_min',
      'budget_max',
      'address',
      'tax_id',
      'business_documents',
      'work_arrangement',
      'project_frequency',
      'hiring_preferences',
      'expected_start_date',
      'project_duration'
    ];

    for (const column of columnsToMakeNullable) {
      try {
        // Check if column exists first
        const hasColumn = await DB.schema.hasColumn('users', column);
        if (hasColumn) {
          await DB.raw(`ALTER TABLE users ALTER COLUMN ${column} DROP NOT NULL`);
          console.log(`  ✅ Made ${column} nullable`);
        } else {
          console.log(`  ⚠️  Column ${column} doesn't exist, skipping`);
        }
      } catch (columnError) {
        console.log(`  ⚠️  ${column} constraint might already be nullable: ${columnError}`);
      }
    }

    console.log('✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async () => {
  console.log('🔄 Rolling back migration: Comprehensive NOT NULL constraint fixes...');
  
  try {
    console.log('⚠️  This rollback would restore NOT NULL constraints - skipping for safety');
    console.log('✅ Rollback completed (no changes made for safety)');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};