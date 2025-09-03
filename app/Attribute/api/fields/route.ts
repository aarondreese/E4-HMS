import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const result = await query(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Attribute' AND COLUMN_NAME NOT IN ('ID','ROWSTAMP','Name','isActive')`);
    const fields = result.recordset.map((row: any) => ({ name: row.COLUMN_NAME, type: row.DATA_TYPE }));
    return NextResponse.json(fields);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
