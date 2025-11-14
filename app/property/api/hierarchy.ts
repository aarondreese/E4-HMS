import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { PropertyDetails, PropertyHierarchy } from "@/types";

// Helper to get property details by ID
async function getPropertyDetails(propertyId: number): Promise<PropertyDetails | null> {
  const res = await query(
    `SELECT * FROM Property WHERE PropertyID = @propertyId`,
    [{ name: "propertyId", value: propertyId }]
  );
  return res.recordset[0] || null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("propertyId");
  if (!propertyId) {
    return NextResponse.json({ error: "Missing propertyId parameter" }, { status: 400 });
  }
  const id = parseInt(propertyId);
  // Get parent and child relationships
  const hierarchyRes = await query(
    `SELECT * FROM PropertyHierarchy WHERE PropertyID = @id`,
    [{ name: "id", value: id }]
  );
  const hierarchies: PropertyHierarchy[] = hierarchyRes.recordset;
  // Parents: where this property is a child
  const parentIds = hierarchies
    .filter(h => h.ChildPropertyID === id && h.ParentPropertyID)
    .map(h => h.ParentPropertyID!);
  // Children: where this property is a parent
  const childIds = hierarchies
    .filter(h => h.ParentPropertyID === id && h.ChildPropertyID)
    .map(h => h.ChildPropertyID!);
  // Fetch details
  const parents = await Promise.all(parentIds.map(getPropertyDetails));
  const children = await Promise.all(childIds.map(getPropertyDetails));
  return NextResponse.json({
    parents: parents.filter(Boolean),
    children: children.filter(Boolean),
  });
}
