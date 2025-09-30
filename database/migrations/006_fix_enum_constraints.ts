import DB from '../index.schema';

export const up = async () => {
  console.log('🔧 Fixing availability enum constraint...');
  
  try {
    // First, let's check what values are currently in the database
    console.log('📋 Checking current availability values in database...');
    
    const availabilityValues = await DB('users')
      .select('availability')
      .whereNotNull('availability')
      .groupBy('availability')
      .orderBy('availability');
    
    console.log('Current availability values:', availabilityValues.map(row => row.availability));
    
    // Update any non-conforming values
    console.log('🔄 Updating non-conforming availability values...');
    
    // Map old values to new values
    const valueMapping = {
      'Full-time': 'full_time',    // Capital F with hyphen
      'full-time': 'full_time',    // lowercase with hyphen
      'part-time': 'part_time',
      'Part-time': 'part_time',    // Capital P with hyphen
      'on-demand': 'on_demand',
      'On-demand': 'on_demand'     // Capital O with hyphen
      // 'flexible' should already be correct
    };
    
    for (const [oldValue, newValue] of Object.entries(valueMapping)) {
      const updateCount = await DB('users')
        .where('availability', oldValue)
        .update({ availability: newValue });
      
      if (updateCount > 0) {
        console.log(`  ✅ Updated ${updateCount} rows from "${oldValue}" to "${newValue}"`);
      }
    }
    
    // Check hiring_preferences values too
    console.log('📋 Checking hiring_preferences values...');
    const hiringValues = await DB('users')
      .select('hiring_preferences')
      .whereNotNull('hiring_preferences')
      .groupBy('hiring_preferences')
      .orderBy('hiring_preferences');
    
    console.log('Current hiring_preferences values:', hiringValues.map(row => row.hiring_preferences));
    
    // Drop the existing constraints if they exist
    await DB.raw(`
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_availability_check;
    `);
    
    await DB.raw(`
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_hiring_preferences_check;
    `);
    
    // Add the correct check constraints
    await DB.raw(`
      ALTER TABLE users 
      ADD CONSTRAINT users_availability_check 
      CHECK (availability IS NULL OR availability IN ('full_time', 'part_time', 'flexible', 'on_demand'));
    `);
    
    await DB.raw(`
      ALTER TABLE users 
      ADD CONSTRAINT users_hiring_preferences_check 
      CHECK (hiring_preferences IS NULL OR hiring_preferences IN ('individuals', 'agencies', 'both'));
    `);
    
    console.log('✅ Enum constraints fixed successfully');
    
  } catch (error) {
    console.error('❌ Error fixing constraints:', error);
    throw error;
  }
};

export const down = async () => {
  console.log('🔄 Reverting availability constraint fix...');
  
  try {
    await DB.raw(`
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_availability_check;
    `);
    
    await DB.raw(`
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_hiring_preferences_check;
    `);
    
    console.log('✅ Constraints reverted');
  } catch (error) {
    console.error('❌ Error reverting constraints:', error);
    throw error;
  }
};