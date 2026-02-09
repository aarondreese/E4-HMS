import { query } from '../lib/db';

async function introspectTables() {
  try {
    const result = await query(`
      SELECT 
        TABLE_NAME, 
        COLUMN_NAME, 
        DATA_TYPE, 
        CHARACTER_MAXIMUM_LENGTH, 
        IS_NULLABLE,
        COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME IN ('CustomFieldType', 'PropertyCustomField', 'PropertyCustomFieldValue') 
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `);
    
    console.log(JSON.stringify(result.recordset, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

introspectTables();
