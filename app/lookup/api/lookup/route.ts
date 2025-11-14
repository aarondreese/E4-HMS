import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get('groupId');
  
  console.log('groupId:', groupId);
  
  if (!groupId) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const result = await query(
      `SELECT ID, LookupGroupID, Value, isActive
       FROM Lookup
       WHERE LookupGroupID = @groupId AND isActive = 1
       ORDER BY Value`,
      [{ name: 'groupId', value: Number(groupId) }]
    );
    
    const lookups = result.recordset.map((row: any) => ({
      ID: row.ID,
      LookupGroupID: row.LookupGroupID,
      Value: row.Value,
      isActive: row.isActive === 1
    }));
    
    console.log('Lookup query result:', lookups);
    return NextResponse.json(lookups);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Lookup API error:', error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const result = await query(
      `INSERT INTO Lookup (LookupGroupID, Value, isActive, MetaData) 
       VALUES (@LookupGroupID, @Value, @isActive, @MetaData)`,
      [
        { name: 'LookupGroupID', value: body.LookupGroupID },
        { name: 'Value', value: body.Value },
        { name: 'isActive', value: body.isActive },
        { name: 'MetaData', value: body.MetaData ?? null }
      ]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
