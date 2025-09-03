import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

async function getAll() {
  try {
    const result = await query('SELECT * FROM PropertyDetails');
    console.log('PropertyDetails result:', result);
    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('PropertyDetails error:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

async function getByID(id: string) {
  try {
    const result = await query('SELECT * FROM PropertyDetails WHERE PropertyID = @id', [ { name: 'id', value: id } ]);
    console.log('PropertyDetails by ID result:', result);
    return NextResponse.json(result.recordset[0] ?? null);
  } catch (error) {
    console.error('PropertyDetails error:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (id) {
    return await getByID(id);
  }
  return await getAll();
}
