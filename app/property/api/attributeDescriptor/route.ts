import { NextResponse } from 'next/server';
import sql from 'mssql';

// MSSQL connection config - uses env.local
const config = {
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  server: process.env.DB_SERVER!,
  database: process.env.DB_NAME!,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const attributeId = searchParams.get('attributeId');
  // Debug: log config and attributeId
  console.log('MSSQL config:', { user: config.user, server: config.server, database: config.database });
  console.log('attributeId:', attributeId);
  if (!attributeId) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const pool = await sql.connect(config);
    // Query AttributeDescriptor records for the given attributeId
    const result = await pool.request()
      .input('attributeId', sql.Int, Number(attributeId))
      .query(`
        SELECT ID, AttributeID, FieldName, Label, TabNumber, RowNumber, ColumnNumber, LookupGroupID
        FROM AttributeDescriptor
        WHERE AttributeID = @attributeId
        ORDER BY TabNumber, RowNumber, ColumnNumber
      `);
    await pool.close();
    // Map to expected shape for frontend
    const descriptors = result.recordset.map((row: any) => ({
      id: row.ID,
      attributeId: row.AttributeID,
      fieldName: row.FieldName,
      label: row.Label,
      tab: Number(row.TabNumber),
      row: Number(row.RowNumber),
      col: Number(row.ColumnNumber),
      lookupGroupId: row.LookupGroupID ?? undefined,
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
