import DB from '../index.schema';

export const up = async () => {
  console.log('🔄 Running migration: Update users table for Phase 2 registration...');

  try {
    // Check if the table exists and what columns it has
    const tableExists = await DB.schema.hasTable('users');
    
    if (!tableExists) {
      console.log('❌ Users table does not exist. Please run the initial schema creation first.');
      return;
    }

    console.log('📋 Checking existing columns...');
    
    // Check individual columns
    const columns = {
      first_name: await DB.schema.hasColumn('users', 'first_name'),
      last_name: await DB.schema.hasColumn('users', 'last_name'),
      full_name: await DB.schema.hasColumn('users', 'full_name'),
      address_line_first: await DB.schema.hasColumn('users', 'address_line_first'),
      address_line_second: await DB.schema.hasColumn('users', 'address_line_second'),
      phone_verified: await DB.schema.hasColumn('users', 'phone_verified'),
      skills: await DB.schema.hasColumn('users', 'skills'),
      experience_level: await DB.schema.hasColumn('users', 'experience_level'),
      availability: await DB.schema.hasColumn('users', 'availability'),
      work_type: await DB.schema.hasColumn('users', 'work_type'),
      hours_per_week: await DB.schema.hasColumn('users', 'hours_per_week'),
      languages: await DB.schema.hasColumn('users', 'languages'),
      id_type: await DB.schema.hasColumn('users', 'id_type'),
      id_document_url: await DB.schema.hasColumn('users', 'id_document_url'),
      industry: await DB.schema.hasColumn('users', 'industry'),
      website: await DB.schema.hasColumn('users', 'website'),
      social_links: await DB.schema.hasColumn('users', 'social_links'),
      company_size: await DB.schema.hasColumn('users', 'company_size'),
      required_services: await DB.schema.hasColumn('users', 'required_services'),
      required_skills: await DB.schema.hasColumn('users', 'required_skills'),
      required_editor_proficiencies: await DB.schema.hasColumn('users', 'required_editor_proficiencies'),
      required_videographer_proficiencies: await DB.schema.hasColumn('users', 'required_videographer_proficiencies'),
      budget_min: await DB.schema.hasColumn('users', 'budget_min'),
      budget_max: await DB.schema.hasColumn('users', 'budget_max'),
      address: await DB.schema.hasColumn('users', 'address'),
      tax_id: await DB.schema.hasColumn('users', 'tax_id'),
      business_documents: await DB.schema.hasColumn('users', 'business_documents'),
      work_arrangement: await DB.schema.hasColumn('users', 'work_arrangement'),
      project_frequency: await DB.schema.hasColumn('users', 'project_frequency'),
      hiring_preferences: await DB.schema.hasColumn('users', 'hiring_preferences'),
      expected_start_date: await DB.schema.hasColumn('users', 'expected_start_date'),
      project_duration: await DB.schema.hasColumn('users', 'project_duration'),
    };

    console.log('🔧 Altering users table...');

    await DB.schema.alterTable('users', (table) => {
      // Add name columns if they don't exist
      if (!columns.first_name) {
        console.log('  ➕ Adding first_name column...');
        table.string('first_name').nullable();
      }
      if (!columns.last_name) {
        console.log('  ➕ Adding last_name column...');
        table.string('last_name').nullable();
      }

      // Add address fields if they don't exist
      if (!columns.address_line_first) {
        console.log('  ➕ Adding address_line_first column...');
        table.string('address_line_first').nullable();
      }
      if (!columns.address_line_second) {
        console.log('  ➕ Adding address_line_second column...');
        table.string('address_line_second').nullable();
      }
      if (!columns.phone_verified) {
        console.log('  ➕ Adding phone_verified column...');
        table.boolean('phone_verified').defaultTo(false);
      }

      // Add freelancer fields if they don't exist
      if (!columns.skills) {
        console.log('  ➕ Adding skills column...');
        table.jsonb('skills').nullable();
      }
      if (!columns.experience_level) {
        console.log('  ➕ Adding experience_level column...');
        table.enu('experience_level', ['entry', 'intermediate', 'expert', 'master']).nullable();
      }
      if (!columns.availability) {
        console.log('  ➕ Adding availability column...');
        table.enu('availability', ['full_time', 'part_time', 'flexible', 'on_demand']).nullable();
      }
      if (!columns.work_type) {
        console.log('  ➕ Adding work_type column...');
        table.enu('work_type', ['remote', 'on_site', 'hybrid']).nullable();
      }
      if (!columns.hours_per_week) {
        console.log('  ➕ Adding hours_per_week column...');
        table.enu('hours_per_week', ['less_than_20', '20_30', '30_40', 'more_than_40']).nullable();
      }
      if (!columns.languages) {
        console.log('  ➕ Adding languages column...');
        table.jsonb('languages').nullable();
      }
      if (!columns.id_type) {
        console.log('  ➕ Adding id_type column...');
        table.enu('id_type', ['passport', 'driving_license', 'national_id']).nullable();
      }
      if (!columns.id_document_url) {
        console.log('  ➕ Adding id_document_url column...');
        table.string('id_document_url').nullable();
      }

      // Add client fields if they don't exist
      if (!columns.industry) {
        console.log('  ➕ Adding industry column...');
        table.enu('industry', ['film', 'ad_agency', 'events', 'youtube', 'corporate', 'other']).nullable();
      }
      if (!columns.website) {
        console.log('  ➕ Adding website column...');
        table.string('website').nullable();
      }
      if (!columns.social_links) {
        console.log('  ➕ Adding social_links column...');
        table.string('social_links').nullable();
      }
      if (!columns.company_size) {
        console.log('  ➕ Adding company_size column...');
        table.enu('company_size', ['1-10', '11-50', '51-200', '200+']).nullable();
      }
      if (!columns.required_services) {
        console.log('  ➕ Adding required_services column...');
        table.jsonb('required_services').nullable();
      }
      if (!columns.required_skills) {
        console.log('  ➕ Adding required_skills column...');
        table.jsonb('required_skills').nullable();
      }
      if (!columns.required_editor_proficiencies) {
        console.log('  ➕ Adding required_editor_proficiencies column...');
        table.jsonb('required_editor_proficiencies').nullable();
      }
      if (!columns.required_videographer_proficiencies) {
        console.log('  ➕ Adding required_videographer_proficiencies column...');
        table.jsonb('required_videographer_proficiencies').nullable();
      }
      if (!columns.budget_min) {
        console.log('  ➕ Adding budget_min column...');
        table.decimal('budget_min', 12, 2).nullable();
      }
      if (!columns.budget_max) {
        console.log('  ➕ Adding budget_max column...');
        table.decimal('budget_max', 12, 2).nullable();
      }
      if (!columns.address) {
        console.log('  ➕ Adding address column...');
        table.string('address').nullable();
      }
      if (!columns.tax_id) {
        console.log('  ➕ Adding tax_id column...');
        table.string('tax_id').nullable();
      }
      if (!columns.business_documents) {
        console.log('  ➕ Adding business_documents column...');
        table.jsonb('business_documents').nullable();
      }
      if (!columns.work_arrangement) {
        console.log('  ➕ Adding work_arrangement column...');
        table.enu('work_arrangement', ['remote', 'on_site', 'hybrid']).nullable();
      }
      if (!columns.project_frequency) {
        console.log('  ➕ Adding project_frequency column...');
        table.enu('project_frequency', ['one_time', 'occasional', 'ongoing']).nullable();
      }
      if (!columns.hiring_preferences) {
        console.log('  ➕ Adding hiring_preferences column...');
        table.enu('hiring_preferences', ['individuals', 'agencies', 'both']).nullable();
      }
      if (!columns.expected_start_date) {
        console.log('  ➕ Adding expected_start_date column...');
        table.string('expected_start_date').nullable();
      }
      if (!columns.project_duration) {
        console.log('  ➕ Adding project_duration column...');
        table.enu('project_duration', ['less_than_week', '1_2_weeks', '2_4_weeks', '1_3_months', '3_plus_months']).nullable();
      }
    });

    // If we had full_name column, migrate the data
    if (columns.full_name && !columns.first_name && !columns.last_name) {
      console.log('📊 Migrating data from full_name to first_name/last_name...');
      
      const users = await DB('users').select('user_id', 'full_name').whereNotNull('full_name');
      
      for (const user of users) {
        const nameParts = user.full_name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        await DB('users')
          .where('user_id', user.user_id)
          .update({
            first_name: firstName,
            last_name: lastName
          });
      }
      
      console.log(`  ✅ Migrated ${users.length} user records`);
    }

    console.log('✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const down = async () => {
  console.log('🔄 Rolling back migration: Update users table for Phase 2 registration...');
  
  try {
    await DB.schema.alterTable('users', (table) => {
      // Remove columns added in this migration
      // Note: Be careful with this in production - you might lose data
      console.log('  ➖ Removing added columns...');
      
      table.dropColumn('skills');
      table.dropColumn('experience_level');
      table.dropColumn('availability');
      table.dropColumn('work_type');
      table.dropColumn('hours_per_week');
      table.dropColumn('languages');
      table.dropColumn('id_type');
      table.dropColumn('id_document_url');
      table.dropColumn('industry');
      table.dropColumn('website');
      table.dropColumn('social_links');
      table.dropColumn('company_size');
      table.dropColumn('required_services');
      table.dropColumn('required_skills');
      table.dropColumn('required_editor_proficiencies');
      table.dropColumn('required_videographer_proficiencies');
      table.dropColumn('budget_min');
      table.dropColumn('budget_max');
      table.dropColumn('address');
      table.dropColumn('tax_id');
      table.dropColumn('business_documents');
      table.dropColumn('work_arrangement');
      table.dropColumn('project_frequency');
      table.dropColumn('hiring_preferences');
      table.dropColumn('expected_start_date');
      table.dropColumn('project_duration');
      table.dropColumn('address_line_first');
      table.dropColumn('address_line_second');
      table.dropColumn('phone_verified');
    });

    console.log('✅ Rollback completed successfully!');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};