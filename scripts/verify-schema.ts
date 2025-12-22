
import DB from '../database/index';

const verifySchema = async () => {
    try {
        console.log('Verifying notification table schema...');

        const tableInfo = await DB.raw(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'notification';
    `);

        console.log('Columns found:', tableInfo.rows);

        const hasMeta = tableInfo.rows.some((row: any) => row.column_name === 'meta');
        console.log('Has meta column:', hasMeta);

    } catch (error) {
        console.error('Error verifying schema:', error);
    } finally {
        process.exit(0);
    }
};

verifySchema();
