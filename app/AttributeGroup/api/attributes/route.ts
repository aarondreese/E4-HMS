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

// POST: Add an attribute to an attribute group
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { attributeGroupId, attributeId } = body;

    if (!attributeGroupId || !attributeId) {
      return NextResponse.json(
        { error: 'AttributeGroupID and AttributeID are required' },
        { status: 400 }
      );
    }

    // Check if the relationship already exists
    const existingResult = await query(
      `SELECT ID FROM AttributeGroupAttribute 
       WHERE AttributeGroupID = @attributeGroupId AND AttributeID = @attributeId`,
      [
        { name: 'attributeGroupId', value: attributeGroupId },
        { name: 'attributeId', value: attributeId }
      ]
    );

    if (existingResult.recordset.length > 0) {
      return NextResponse.json(
        { error: 'Attribute is already in this group' },
        { status: 409 }
      );
    }

    // Insert the new relationship
    const result = await query(
      `INSERT INTO AttributeGroupAttribute (AttributeGroupID, AttributeID) 
       OUTPUT INSERTED.ID 
       VALUES (@attributeGroupId, @attributeId)`,
      [
        { name: 'attributeGroupId', value: attributeGroupId },
        { name: 'attributeId', value: attributeId }
      ]
    );

    return NextResponse.json({ 
      success: true, 
      id: result.recordset[0].ID 
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// DELETE: Remove an attribute from an attribute group
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const attributeGroupId = searchParams.get('attributeGroupId');
    const attributeId = searchParams.get('attributeId');

    if (!attributeGroupId || !attributeId) {
      return NextResponse.json(
        { error: 'AttributeGroupID and AttributeID are required' },
        { status: 400 }
      );
    }

    // Delete the relationship
    const result = await query(
      `DELETE FROM AttributeGroupAttribute 
       WHERE AttributeGroupID = @attributeGroupId AND AttributeID = @attributeId`,
      [
        { name: 'attributeGroupId', value: attributeGroupId },
        { name: 'attributeId', value: attributeId }
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
