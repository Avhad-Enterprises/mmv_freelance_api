import DB from '../index.schema';

export const up = async () => {
  console.log('🔧 Fixing all remaining enum constraints...');
  
  try {
    // Check experience_level values
    console.log('📋 Checking experience_level values...');
    const experienceValues = await DB('users')
      .select('experience_level')
      .whereNotNull('experience_level')
      .groupBy('experience_level')
      .orderBy('experience_level');
    
    console.log('Current experience_level values:', experienceValues.map(row => row.experience_level));
    
    // Update experience_level values
    const experienceMapping = {
      'Beginner': 'entry',        // Found in database
      'Entry': 'entry',
      'Intermediate': 'intermediate', 
      'Expert': 'expert',
      'Master': 'master',
      'Senior': 'expert',  // Map Senior to expert
      'Junior': 'entry'    // Map Junior to entry
    };
    
    for (const [oldValue, newValue] of Object.entries(experienceMapping)) {
      const updateCount = await DB('users')
        .where('experience_level', oldValue)
        .update({ experience_level: newValue });
      
      if (updateCount > 0) {
        console.log(`  ✅ Updated ${updateCount} rows from "${oldValue}" to "${newValue}"`);
      }
    }
    
    // Update work_type values
    const workTypeMapping = {
      'On-Site': 'on_site',       // Found in database
      'Remote': 'remote',
      'Hybrid': 'hybrid'
    };
    
    for (const [oldValue, newValue] of Object.entries(workTypeMapping)) {
      const updateCount = await DB('users')
        .where('work_type', oldValue)
        .update({ work_type: newValue });
      
      if (updateCount > 0) {
        console.log(`  ✅ Updated ${updateCount} work_type rows from "${oldValue}" to "${newValue}"`);
      }
    }
    
    // Check other enum fields
    const enumFields = [
      'id_type', 'work_type', 'hours_per_week', 'industry', 
      'company_size', 'work_arrangement', 'project_frequency'
    ];
    
    for (const field of enumFields) {
      console.log(`📋 Checking ${field} values...`);
      const values = await DB('users')
        .select(field)
        .whereNotNull(field)
        .groupBy(field)
        .orderBy(field);
      
      if (values.length > 0) {
        console.log(`Current ${field} values:`, values.map(row => row[field]));
      }
    }
    
    // Drop all existing enum constraints
    const constraintsToFix = [
      'users_experience_level_check',
      'users_id_type_check', 
      'users_work_type_check',
      'users_hours_per_week_check',
      'users_industry_check',
      'users_company_size_check',
      'users_work_arrangement_check',
      'users_project_frequency_check',
      'users_project_duration_check'
    ];
    
    for (const constraint of constraintsToFix) {
      await DB.raw(`ALTER TABLE users DROP CONSTRAINT IF EXISTS ${constraint};`);
    }
    
    // Add corrected constraints (only for string enum fields)
    await DB.raw(`
      ALTER TABLE users 
      ADD CONSTRAINT users_experience_level_check 
      CHECK (experience_level IS NULL OR experience_level IN ('entry', 'intermediate', 'expert', 'master'));
    `);
    
    await DB.raw(`
      ALTER TABLE users 
      ADD CONSTRAINT users_id_type_check 
      CHECK (id_type IS NULL OR id_type IN ('passport', 'driving_license', 'national_id'));
    `);
    
    await DB.raw(`
      ALTER TABLE users 
      ADD CONSTRAINT users_work_type_check 
      CHECK (work_type IS NULL OR work_type IN ('remote', 'on_site', 'hybrid'));
    `);
    
    // Skip hours_per_week constraint - appears to be numeric field
    
    await DB.raw(`
      ALTER TABLE users 
      ADD CONSTRAINT users_industry_check 
      CHECK (industry IS NULL OR industry IN ('film', 'ad_agency', 'events', 'youtube', 'corporate', 'other'));
    `);
    
    await DB.raw(`
      ALTER TABLE users 
      ADD CONSTRAINT users_company_size_check 
      CHECK (company_size IS NULL OR company_size IN ('1-10', '11-50', '51-200', '200+'));
    `);
    
    await DB.raw(`
      ALTER TABLE users 
      ADD CONSTRAINT users_work_arrangement_check 
      CHECK (work_arrangement IS NULL OR work_arrangement IN ('remote', 'on_site', 'hybrid'));
    `);
    
    await DB.raw(`
      ALTER TABLE users 
      ADD CONSTRAINT users_project_frequency_check 
      CHECK (project_frequency IS NULL OR project_frequency IN ('one_time', 'occasional', 'ongoing'));
    `);
    
    await DB.raw(`
      ALTER TABLE users 
      ADD CONSTRAINT users_project_duration_check 
      CHECK (project_duration IS NULL OR project_duration IN ('less_than_week', '1_2_weeks', '2_4_weeks', '1_3_months', '3_plus_months'));
    `);
    
    console.log('✅ All enum constraints fixed successfully');
    
  } catch (error) {
    console.error('❌ Error fixing enum constraints:', error);
    throw error;
  }
};

export const down = async () => {
  console.log('🔄 Reverting enum constraint fixes...');
  
  try {
    const constraintsToRemove = [
      'users_experience_level_check',
      'users_id_type_check', 
      'users_work_type_check',
      'users_hours_per_week_check',
      'users_industry_check',
      'users_company_size_check',
      'users_work_arrangement_check',
      'users_project_frequency_check',
      'users_project_duration_check'
    ];
    
    for (const constraint of constraintsToRemove) {
      await DB.raw(`ALTER TABLE users DROP CONSTRAINT IF EXISTS ${constraint};`);
    }
    
    console.log('✅ Enum constraints reverted');
  } catch (error) {
    console.error('❌ Error reverting constraints:', error);
    throw error;
  }
};