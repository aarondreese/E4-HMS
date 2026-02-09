import { NextRequest, NextResponse } from 'next/server';
import { query, getConnection } from '@/lib/db';
import sql from 'mssql';

// GET: List all PropertyCustomFields or get by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const result = await query(
        `SELECT 
          pcf.ID, 
          pcf.FieldName, 
          pcf.FieldLabel, 
          pcf.CustomFieldTypeID, 
          pcf.TabNumber, 
          pcf.RowNumber, 
          pcf.ColNumber, 
          pcf.isActive,
          pcf.Rules,
          cft.FieldTypeDescription as CustomFieldTypeName
        FROM PropertyCustomField pcf
        LEFT JOIN CustomFieldType cft ON pcf.CustomFieldTypeID = cft.ID
        WHERE pcf.ID = @id`,
        [{ name: 'id', value: parseInt(id) }]
      );
      
      const record = result.recordset[0];
      if (record && record.Rules) {
        // Convert XML to string if needed
        record.Rules = record.Rules.toString();
      }
      return NextResponse.json(record ?? {});
    } else {
      const result = await query(
        `SELECT 
          pcf.ID, 
          pcf.FieldName, 
          pcf.FieldLabel, 
          pcf.CustomFieldTypeID, 
          pcf.TabNumber, 
          pcf.RowNumber, 
          pcf.ColNumber, 
          pcf.isActive,
          cft.FieldTypeDescription as CustomFieldTypeName
        FROM PropertyCustomField pcf
        LEFT JOIN CustomFieldType cft ON pcf.CustomFieldTypeID = cft.ID
        ORDER BY pcf.TabNumber, pcf.RowNumber, pcf.ColNumber`
      );
      return NextResponse.json(result.recordset);
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST: Create a new PropertyCustomField
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { FieldName, FieldLabel, CustomFieldTypeID, TabNumber, RowNumber, ColNumber, isActive, Rules } = body;

    if (!FieldName || !FieldLabel || !CustomFieldTypeID) {
      return NextResponse.json(
        { error: 'FieldName, FieldLabel, and CustomFieldTypeID are required' },
        { status: 400 }
      );
    }

    // Validate TabNumber is 1, 2, or 3
    const tabNum = TabNumber ?? 1;
    if (![1, 2, 3].includes(tabNum)) {
      return NextResponse.json(
        { error: 'Tab number must be 1, 2, or 3' },
        { status: 400 }
      );
    }

    // Check for unique Tab/Row/Col combination
    const rowNum = RowNumber ?? 1;
    const colNum = ColNumber ?? 1;
    
    const existingCheck = await query(
      'SELECT ID FROM PropertyCustomField WHERE TabNumber = @tab AND RowNumber = @row AND ColNumber = @col',
      [
        { name: 'tab', value: tabNum },
        { name: 'row', value: rowNum },
        { name: 'col', value: colNum }
      ]
    );

    if (existingCheck.recordset.length > 0) {
      return NextResponse.json(
        { error: `A field already exists at Tab ${tabNum}, Row ${rowNum}, Column ${colNum}. Please choose a different position.` },
        { status: 400 }
      );
    }

    const pool = await getConnection();
    const req = pool.request();
    
    req.input('FieldName', sql.VarChar(100), FieldName);
    req.input('FieldLabel', sql.VarChar(100), FieldLabel);
    req.input('CustomFieldTypeID', sql.Int, CustomFieldTypeID);
    req.input('TabNumber', sql.Int, tabNum);
    req.input('RowNumber', sql.Int, rowNum);
    req.input('ColNumber', sql.Int, colNum);
    req.input('isActive', sql.Bit, isActive ?? 1);
    req.input('Rules', sql.Xml, Rules ?? null);

    const result = await req.query(
      `INSERT INTO PropertyCustomField 
        (FieldName, FieldLabel, CustomFieldTypeID, TabNumber, RowNumber, ColNumber, isActive, Rules)
      OUTPUT INSERTED.ID
      VALUES (@FieldName, @FieldLabel, @CustomFieldTypeID, @TabNumber, @RowNumber, @ColNumber, @isActive, @Rules)`
    );

    const newId = result.recordset[0]?.ID;
    return NextResponse.json({ id: newId, success: true });
  } catch (error) {
    console.error('PropertyCustomField POST error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// PATCH: Update an existing PropertyCustomField
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    const body = await request.json();
    
    // Validate TabNumber if provided
    if ('TabNumber' in body && ![1, 2, 3].includes(body.TabNumber)) {
      return NextResponse.json(
        { error: 'Tab number must be 1, 2, or 3' },
        { status: 400 }
      );
    }

    // Check for unique Tab/Row/Col combination if any position field is being updated
    if ('TabNumber' in body || 'RowNumber' in body || 'ColNumber' in body) {
      // Get current record to fill in any non-updated position values
      const currentRecord = await query(
        'SELECT TabNumber, RowNumber, ColNumber FROM PropertyCustomField WHERE ID = @id',
        [{ name: 'id', value: parseInt(id) }]
      );

      if (currentRecord.recordset.length === 0) {
        return NextResponse.json({ error: 'Record not found' }, { status: 404 });
      }

      const current = currentRecord.recordset[0];
      const newTab = 'TabNumber' in body ? body.TabNumber : current.TabNumber;
      const newRow = 'RowNumber' in body ? body.RowNumber : current.RowNumber;
      const newCol = 'ColNumber' in body ? body.ColNumber : current.ColNumber;

      // Check if another record already uses this position
      const existingCheck = await query(
        'SELECT ID FROM PropertyCustomField WHERE TabNumber = @tab AND RowNumber = @row AND ColNumber = @col AND ID != @currentId',
        [
          { name: 'tab', value: newTab },
          { name: 'row', value: newRow },
          { name: 'col', value: newCol },
          { name: 'currentId', value: parseInt(id) }
        ]
      );

      if (existingCheck.recordset.length > 0) {
        return NextResponse.json(
          { error: `A field already exists at Tab ${newTab}, Row ${newRow}, Column ${newCol}. Please choose a different position.` },
          { status: 400 }
        );
      }
    }

    const pool = await getConnection();
    const req = pool.request();

    const updates: string[] = [];
    
    if ('FieldName' in body) {
      req.input('FieldName', sql.VarChar(100), body.FieldName);
      updates.push('FieldName = @FieldName');
    }
    if ('FieldLabel' in body) {
      req.input('FieldLabel', sql.VarChar(100), body.FieldLabel);
      updates.push('FieldLabel = @FieldLabel');
    }
    if ('CustomFieldTypeID' in body) {
      req.input('CustomFieldTypeID', sql.Int, body.CustomFieldTypeID);
      updates.push('CustomFieldTypeID = @CustomFieldTypeID');
    }
    if ('TabNumber' in body) {
      req.input('TabNumber', sql.Int, body.TabNumber);
      updates.push('TabNumber = @TabNumber');
    }
    if ('RowNumber' in body) {
      req.input('RowNumber', sql.Int, body.RowNumber);
      updates.push('RowNumber = @RowNumber');
    }
    if ('ColNumber' in body) {
      req.input('ColNumber', sql.Int, body.ColNumber);
      updates.push('ColNumber = @ColNumber');
    }
    if ('isActive' in body) {
      req.input('isActive', sql.Bit, body.isActive);
      updates.push('isActive = @isActive');
    }
    if ('Rules' in body) {
      req.input('Rules', sql.Xml, body.Rules);
      updates.push('Rules = @Rules');
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    req.input('id', sql.Int, parseInt(id));
    await req.query(`UPDATE PropertyCustomField SET ${updates.join(', ')} WHERE ID = @id`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PropertyCustomField PATCH error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// DELETE: Delete a PropertyCustomField
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    await query('DELETE FROM PropertyCustomField WHERE ID = @id', [
      { name: 'id', value: parseInt(id) }
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PropertyCustomField DELETE error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
