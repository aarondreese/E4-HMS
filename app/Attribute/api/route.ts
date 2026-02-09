import { NextRequest, NextResponse } from 'next/server';
import { query, getConnection } from '@/lib/db';
import sql from 'mssql';

// Helper to convert varbinary to base64
function bufferToBase64(buffer: Buffer | null): string | null {
  if (!buffer) return null;
  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}

// Helper to convert base64 to buffer
function base64ToBuffer(base64: string | null): Buffer | null {
  if (!base64) return null;
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

// GET: List all attributes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      const result = await query('SELECT ID, Name, isActive, Image01, Image02, Image03 FROM Attribute WHERE ID = @id', [
        { name: 'id', value: parseInt(id) }
      ]);
      const record = result.recordset[0];
      if (record) {
        // Convert varbinary to base64
        record.Image01 = bufferToBase64(record.Image01);
        record.Image02 = bufferToBase64(record.Image02);
        record.Image03 = bufferToBase64(record.Image03);
      }
      return NextResponse.json(record ?? {});
    } else {
      const result = await query('SELECT ID, Name, isActive, Image01, Image02, Image03 FROM Attribute');
      // Convert varbinary to base64 for each record
      const records = result.recordset.map((record: any) => ({
        ...record,
        Image01: bufferToBase64(record.Image01),
        Image02: bufferToBase64(record.Image02),
        Image03: bufferToBase64(record.Image03),
      }));
      return NextResponse.json(records);
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// PATCH: Update image fields
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    const body = await request.json();
    const pool = await getConnection();
    const req = pool.request();

    // Build dynamic update query based on provided fields
    const updates: string[] = [];
    if ('Image01' in body) {
      req.input('Image01', sql.VarBinary, base64ToBuffer(body.Image01));
      updates.push('Image01 = @Image01');
    }
    if ('Image02' in body) {
      req.input('Image02', sql.VarBinary, base64ToBuffer(body.Image02));
      updates.push('Image02 = @Image02');
    }
    if ('Image03' in body) {
      req.input('Image03', sql.VarBinary, base64ToBuffer(body.Image03));
      updates.push('Image03 = @Image03');
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    req.input('id', sql.Int, parseInt(id));
    await req.query(`UPDATE Attribute SET ${updates.join(', ')} WHERE ID = @id`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Attribute PATCH error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
