import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { AttributeGroup } from '@/types';

// GET: List all attribute groups
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      const result = await query('SELECT * FROM AttributeGroup WHERE ID = @id', [ { name: 'id', value: id } ]);
      return NextResponse.json(result.recordset[0] ?? null);
    }
    const result = await query('SELECT * FROM AttributeGroup');
    return NextResponse.json(result.recordset as AttributeGroup[]);
  } catch (error) {
    console.error('AttributeGroup API Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST: Add a new attribute group
export async function POST(request: NextRequest) {
  try {
    const { Name } = await request.json();
    const result = await query(
      'INSERT INTO AttributeGroup (Name, isActive) OUTPUT INSERTED.ID VALUES (@Name, 1)',
      [
        { name: 'Name', value: Name }
      ]
    );
    return NextResponse.json({ id: result.recordset[0].ID });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
