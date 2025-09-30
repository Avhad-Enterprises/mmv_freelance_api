import DB from '../index.schema';

export const up = async () => {
  console.log('🔧 Fixing portfolio_links field type...');
  
  try {
    // Check current data type
    const columnInfo = await DB.raw(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'portfolio_links';
    `);
    
    console.log('Current portfolio_links data type:', columnInfo.rows[0]?.data_type);
    
    // If it's currently jsonb, we need to convert it to text
    if (columnInfo.rows[0]?.data_type === 'jsonb') {
      console.log('Converting portfolio_links from jsonb to text...');
      
      // Change the column type directly, extracting string value from jsonb
      await DB.raw(`
        ALTER TABLE users 
        ALTER COLUMN portfolio_links TYPE TEXT 
        USING CASE 
          WHEN portfolio_links IS NULL THEN NULL
          WHEN jsonb_typeof(portfolio_links) = 'string' THEN portfolio_links #>> '{}'
          ELSE portfolio_links::text
        END;
      `);
      
      console.log('✅ portfolio_links converted to text type');
    } else {
      console.log('✅ portfolio_links is already text type');
    }
    
  } catch (error) {
    console.error('❌ Error fixing portfolio_links:', error);
    throw error;
  }
};

export const down = async () => {
  console.log('🔄 Reverting portfolio_links field type...');
  
  try {
    // Convert back to jsonb if needed
    await DB.raw(`
      ALTER TABLE users 
      ALTER COLUMN portfolio_links TYPE JSONB 
      USING CASE 
        WHEN portfolio_links IS NULL THEN NULL 
        ELSE to_jsonb(portfolio_links) 
      END;
    `);
    
    console.log('✅ Reverted portfolio_links to jsonb');
  } catch (error) {
    console.error('❌ Error reverting portfolio_links:', error);
    throw error;
  }
};