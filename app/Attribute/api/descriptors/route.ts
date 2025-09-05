import { NextRequest, NextResponse } from 'next/server';
import { query, getConnection } from '@/lib/db';

// GET: AttributeDescriptor records for a given AttributeID
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }
  try {
    const result = await query(
      `SELECT ID, AttributeID, FieldName, Label, TabNumber, RowNumber, ColumnNumber, LookupGroupID FROM AttributeDescriptor WHERE AttributeID = @id`,
      [{ name: 'id', value: parseInt(id) }]
    );
    return NextResponse.json(result.recordset);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST: Insert AttributeDescriptor records
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[AttributeDescriptor POST] Payload:', body);
    if (!Array.isArray(body)) {
      console.error('[AttributeDescriptor POST] Payload is not an array');
      return NextResponse.json({ error: 'Payload must be an array' }, { status: 400 });
    }
    const pool = await getConnection();
    for (const record of body) {
      console.log('[AttributeDescriptor POST] Inserting record:', record);
      await pool.request()
        .input('AttributeID', record.AttributeID)
        .input('TabNumber', record.TabNumber)
        .input('RowNumber', record.RowNumber)
        .input('ColumnNumber', record.ColumnNumber)
        .input('FieldName', record.FieldName)
        .input('Label', record.Label)
        .input('LookupGroupID', record.LookupGroupID ?? null)
        .execute('usp_InsertAttributeDescriptor');
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[AttributeDescriptor POST] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
