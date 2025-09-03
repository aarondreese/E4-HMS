import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { AttributeGroup } from '@/lib/attributeGroup';

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
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST: Add a new attribute group
export async function POST(request: NextRequest) {
  try {
    const { Name, Description } = await request.json();
    // Call stored procedure
    const result = await query(
      'EXEC AddAttributeGroup @Name, @Description',
      [
        { name: 'Name', value: Name },
        { name: 'Description', value: Description }
      ]
    );
    return NextResponse.json({ AttributeGroupID: result.recordset[0].AttributeGroupID });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
