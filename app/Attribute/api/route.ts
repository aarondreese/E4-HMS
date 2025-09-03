import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: List all attributes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      const result = await query('SELECT ID, Name, isActive FROM Attribute WHERE ID = @id', [
        { name: 'id', value: parseInt(id) }
      ]);
      return NextResponse.json(result.recordset[0] ?? {});
    } else {
      const result = await query('SELECT ID, Name, isActive FROM Attribute');
      return NextResponse.json(result.recordset);
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
