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

export async function GET() {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM LookupGroup');
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
      .input('Name', sql.NVarChar, body.Name)
      .input('Description', sql.NVarChar, body.Description)
      .input('IsActive', sql.Bit, body.IsActive ? 1 : 0)
      .query('INSERT INTO LookupGroup (Name, Description, IsActive) VALUES (@Name, @Description, @IsActive)');
    await pool.close();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
