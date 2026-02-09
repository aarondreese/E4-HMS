import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
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
    
    return NextResponse.json(result.recordset);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
