import { NextResponse } from 'next/server';
import sql from 'mssql';

// MSSQL connection config - values must be set in .env.local
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

// Helper to convert varbinary to base64
function bufferToBase64(buffer: Buffer | null): string | null {
  if (!buffer) return null;
  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get('propertyId');
  if (!propertyId) {
    return NextResponse.json({ error: 'Missing propertyId' }, { status: 400 });
  }

  try {
    // Connect to MSSQL
    const pool = await sql.connect(config);
    // Query property attributes for the given propertyId with AttributeGroup information for proper sorting
    const result = await pool.request()
      .input('propertyId', sql.Int, Number(propertyId))
      .query(`
  SELECT pa.ID, pa.ROWSTAMP, pa.PropertyID, pa.AttributeID, pa.isActive, pa.String01, pa.String02, pa.String03,
  pa.Date01, pa.Date02, pa.Date03, pa.Int01, pa.Int02, pa.Int03, pa.Decimal01, pa.Decimal02, pa.Decimal03,
  pa.Lookup01, pa.Lookup02, pa.Lookup03, pa.Boolean01, pa.Boolean02, pa.Boolean03, pa.Image01, pa.Image02, pa.Image03, a.Name,
  ag.Name AS AttributeGroupName, ag.ID AS AttributeGroupID
  FROM PropertyAttribute pa
  JOIN Attribute a ON pa.AttributeID = a.ID
  LEFT JOIN AttributeGroupAttribute aga ON a.ID = aga.AttributeID
  LEFT JOIN AttributeGroup ag ON aga.AttributeGroupID = ag.ID
  WHERE pa.PropertyID = @propertyId
  ORDER BY 
    ISNULL(ag.Name, 'ZZZ_Ungrouped') ASC,  -- AttributeGroup name (ungrouped attributes at end)
    a.Name ASC,                            -- Attribute name
    pa.ID ASC                              -- AttributeOccurrence ID (PropertyAttribute.ID)
      `);
    await pool.close();
    // Convert varbinary image fields to base64
    const records = result.recordset.map((record: any) => ({
      ...record,
      Image01: bufferToBase64(record.Image01),
      Image02: bufferToBase64(record.Image02),
      Image03: bufferToBase64(record.Image03),
    }));
    return NextResponse.json(records);
  } catch (error) {
    console.error('PropertyAttributes API Error:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
