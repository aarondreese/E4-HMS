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
  if (!attributeId) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const pool = await sql.connect(config);
    // Query AttributeDescriptor records for the given attributeId
    const result = await pool.request()
      .input('attributeId', sql.Int, Number(attributeId))
      .query(`
        SELECT FieldName, Label, Tab, Row, Col
        FROM AttributeDescriptor
        WHERE AttributeID = @attributeId
        ORDER BY Tab, Row, Col
      `);
    await pool.close();
    // Map to expected shape for frontend
    const descriptors = result.recordset.map((row: any) => ({
      fieldName: row.FieldName,
      label: row.Label,
      tab: Number(row.Tab),
      row: Number(row.Row),
      col: Number(row.Col),
    }));
    return NextResponse.json(descriptors);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
