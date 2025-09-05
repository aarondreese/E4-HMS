import { NextResponse } from 'next/server';
import sql from 'mssql';

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
  const groupId = searchParams.get('groupId');
  if (!groupId) {
    return NextResponse.json({ error: 'Missing groupId' }, { status: 400 });
  }
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('groupId', sql.Int, Number(groupId))
      .query('SELECT * FROM Lookup WHERE LookupGroupID = @groupId');
    await pool.close();
    return NextResponse.json(result.recordset);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('LookupGroupID', sql.Int, body.LookupGroupID)
      .input('Value', sql.NVarChar, body.Value)
      .input('isActive', sql.TinyInt, body.isActive)
      .input('MetaData', sql.NVarChar(sql.MAX), body.MetaData ?? null)
      .query('INSERT INTO Lookup (LookupGroupID, Value, isActive, MetaData) VALUES (@LookupGroupID, @Value, @isActive, @MetaData)');
    await pool.close();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
