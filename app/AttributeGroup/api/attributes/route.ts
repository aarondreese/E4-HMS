import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET: List all AttributeGroupAttribute records for a group, with Attribute.Name
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    if (!groupId) {
      return NextResponse.json([], { status: 200 });
    }
    const result = await query(
      `SELECT aga.ID, aga.AttributeGroupID, aga.AttributeID, a.Name AS AttributeName
       FROM AttributeGroupAttribute aga
       JOIN Attribute a ON aga.AttributeID = a.ID
       WHERE aga.AttributeGroupID = @groupId`,
      [ { name: 'groupId', value: groupId } ]
    );
    return NextResponse.json(result.recordset);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
