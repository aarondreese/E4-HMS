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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get('propertyId');
  if (!propertyId) {
    return NextResponse.json({ error: 'Missing propertyId' }, { status: 400 });
  }

  try {
    // Connect to MSSQL
    const pool = await sql.connect(config);
    // Query property attributes for the given propertyId
    const result = await pool.request()
      .input('propertyId', sql.Int, Number(propertyId))
      .query(`
  SELECT pa.ID, pa.ROWSTAMP, pa.PropertyID, pa.isActive, pa.String01, pa.String02, pa.String03,
  pa.Date01, pa.Date02, pa.Date03, pa.Int01, pa.Int02, pa.Int03, pa.Decimal01, pa.Decimal02, pa.Decimal03,
  pa.Lookup01, pa.Lookup02, pa.Lookup03, pa.Boolean01, pa.Boolean02, pa.Boolean03, a.Name
  FROM PropertyAttribute pa
  JOIN Attribute a ON pa.AttributeID = a.ID
   WHERE pa.PropertyID = @propertyId
      `);
    await pool.close();
    return NextResponse.json(result.recordset);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
