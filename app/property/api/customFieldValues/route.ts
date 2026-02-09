import { NextRequest, NextResponse } from 'next/server';
import { query, getConnection } from '@/lib/db';
import sql from 'mssql';

// GET: Get custom fields with their values for a specific property
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    
    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId is required' }, { status: 400 });
    }

    // Get all active custom field definitions with their current values for this property
    const result = await query(
      `SELECT 
        pcf.ID,
        pcf.FieldName,
        pcf.FieldLabel,
        pcf.CustomFieldTypeID,
        pcf.TabNumber,
        pcf.RowNumber,
        pcf.ColNumber,
        pcf.Rules,
        cft.FieldTypeDescription,
        cft.FieldTypeDefinition,
        pcfv.ID as ValueID,
        pcfv.CustomDate,
        pcfv.CustomDateTime,
        pcfv.CustomTime,
        pcfv.CustomInt,
        pcfv.CustomDecimal,
        pcfv.CustomShortText,
        pcfv.CustomLongText,
        pcfv.CustomMaxText,
        pcfv.CustomBoolean,
        pcfv.CustomImageLink
      FROM PropertyCustomField pcf
      LEFT JOIN CustomFieldType cft ON pcf.CustomFieldTypeID = cft.ID
      LEFT JOIN PropertyCustomFieldValue pcfv 
        ON pcf.ID = pcfv.PropertyCustomFieldID 
        AND pcfv.PropertyID = @propertyId
      WHERE pcf.isActive = 1
      ORDER BY pcf.TabNumber, pcf.RowNumber, pcf.ColNumber`,
      [{ name: 'propertyId', value: parseInt(propertyId) }]
    );

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST: Save/Update custom field values for a property
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { propertyId, fieldId, values } = body;

    if (!propertyId || !fieldId) {
      return NextResponse.json(
        { error: 'propertyId and fieldId are required' },
        { status: 400 }
      );
    }

    // Check if a value record already exists
    const existingRecord = await query(
      'SELECT ID FROM PropertyCustomFieldValue WHERE PropertyID = @propertyId AND PropertyCustomFieldID = @fieldId',
      [
        { name: 'propertyId', value: propertyId },
        { name: 'fieldId', value: fieldId }
      ]
    );

    const pool = await getConnection();
    const req = pool.request();

    req.input('propertyId', sql.Int, propertyId);
    req.input('fieldId', sql.Int, fieldId);
    req.input('CustomDate', sql.Date, values.CustomDate ?? null);
    req.input('CustomDateTime', sql.DateTime, values.CustomDateTime ?? null);
    req.input('CustomTime', sql.Time, values.CustomTime ?? null);
    req.input('CustomInt', sql.Int, values.CustomInt ?? null);
    req.input('CustomDecimal', sql.Decimal(18, 2), values.CustomDecimal ?? null);
    req.input('CustomShortText', sql.NVarChar(100), values.CustomShortText ?? null);
    req.input('CustomLongText', sql.NVarChar(1000), values.CustomLongText ?? null);
    req.input('CustomMaxText', sql.NVarChar(sql.MAX), values.CustomMaxText ?? null);
    req.input('CustomBoolean', sql.Bit, values.CustomBoolean ?? null);
    req.input('CustomImageLink', sql.NVarChar(1000), values.CustomImageLink ?? null);

    if (existingRecord.recordset.length > 0) {
      // Update existing record
      await req.query(`
        UPDATE PropertyCustomFieldValue 
        SET 
          CustomDate = @CustomDate,
          CustomDateTime = @CustomDateTime,
          CustomTime = @CustomTime,
          CustomInt = @CustomInt,
          CustomDecimal = @CustomDecimal,
          CustomShortText = @CustomShortText,
          CustomLongText = @CustomLongText,
          CustomMaxText = @CustomMaxText,
          CustomBoolean = @CustomBoolean,
          CustomImageLink = @CustomImageLink
        WHERE PropertyID = @propertyId AND PropertyCustomFieldID = @fieldId
      `);
    } else {
      // Insert new record
      await req.query(`
        INSERT INTO PropertyCustomFieldValue 
          (PropertyID, PropertyCustomFieldID, CustomDate, CustomDateTime, CustomTime, 
           CustomInt, CustomDecimal, CustomShortText, CustomLongText, CustomMaxText, 
           CustomBoolean, CustomImageLink)
        VALUES 
          (@propertyId, @fieldId, @CustomDate, @CustomDateTime, @CustomTime,
           @CustomInt, @CustomDecimal, @CustomShortText, @CustomLongText, @CustomMaxText,
           @CustomBoolean, @CustomImageLink)
      `);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving custom field value:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
