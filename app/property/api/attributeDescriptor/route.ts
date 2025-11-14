import { NextResponse } from 'next/server';
import sql from 'mssql';
import { query } from '../../../../lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const attributeId = searchParams.get('attributeId');
  // Debug: log attributeId
  console.log('attributeId:', attributeId);
  
  if (!attributeId) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    // Use the common query function from db.ts
    const result = await query(
      `SELECT ID, AttributeID, FieldName, Label, TabNumber, RowNumber, ColumnNumber, LookupGroupID
       FROM AttributeDescriptor
       WHERE AttributeID = @attributeId
       ORDER BY TabNumber, RowNumber, ColumnNumber`,
      [{ name: 'attributeId', value: Number(attributeId) }]
    );
    
    // Map to expected shape for frontend
    const descriptors = result.recordset.map((row: any) => ({
      id: row.ID,
      attributeId: row.AttributeID,
      fieldName: row.FieldName,
      label: row.Label,
      tab: Number(row.TabNumber),
      row: Number(row.RowNumber),
      col: Number(row.ColumnNumber),
      lookupGroupId: row.LookupGroupID,
    }));
    console.log('Descriptor query result:', descriptors);
    return NextResponse.json(descriptors);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    // Debug: log error stack
    console.error('Descriptor API error:', error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
