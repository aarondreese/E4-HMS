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
  const body = await request.json();
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: 'Payload must be an array' }, { status: 400 });
  }
  try {
    const pool = await getConnection();
    for (const record of body) {
      const req = pool.request()
        .input('AttributeID', record.AttributeID)
        .input('TabNumber', record.TabNumber)
        .input('RowNumber', record.RowNumber)
        .input('ColumnNumber', record.ColumnNumber)
        .input('FieldName', record.FieldName)
        .input('Label', record.Label);
      if (record.LookupGroupID !== undefined) {
        req.input('LookupGroupID', record.LookupGroupID);
      }
      await req.execute('usp_InsertAttributeDescriptor');
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
