import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("propertyId");
  if (!propertyId) {
    return NextResponse.json({ error: "Missing propertyId parameter" }, { status: 400 });
  }
  const id = parseInt(propertyId);
  // Get parent property for the given child property
  const sql = `
    SELECT pd.*
    FROM PropertyHierarchy ph
    JOIN PropertyDetails pd ON ph.ParentPropertyID = pd.PropertyID
    WHERE ph.ChildPropertyID = @id
  `;
  const res = await query(sql, [{ name: "id", value: id }]);
  return NextResponse.json(res.recordset);
}
