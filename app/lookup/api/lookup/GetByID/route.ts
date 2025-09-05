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
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('id', sql.Int, Number(id))
      .query('SELECT * FROM Lookup WHERE ID = @id');
    await pool.close();
    return NextResponse.json(result.recordset);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
