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

export async function POST(request: Request) {
  const { Name } = await request.json();
  if (!Name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('Name', sql.NVarChar, Name)
      .query('INSERT INTO Attribute (Name, isActive) OUTPUT INSERTED.ID VALUES (@Name, 1)');
    await pool.close();
    const newId = result.recordset[0]?.ID;
    return NextResponse.json({ id: newId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
