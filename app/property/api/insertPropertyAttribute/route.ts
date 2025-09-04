import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";

// MSSQL connection config - values must be set in .env.local
const config = {
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  server: process.env.DB_SERVER!,
  database: process.env.DB_NAME!,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

function parseUKDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  // Accept DD/MM/YYYY or D/M/YYYY
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year) return null;
  // JS Date: months are 0-based
  const jsDate = new Date(year, month - 1, day);
  // Check for valid date
  return isNaN(jsDate.getTime()) ? null : jsDate;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("InsertPropertyAttribute API called");
  console.log("Request body:", body);
  console.log("MSSQL config:", {
    user: config.user,
    server: config.server,
    database: config.database,
  });

  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    request.input("PropertyID", sql.Int, body.PropertyID ?? null);
    request.input("AttributeID", sql.Int, body.AttributeID ?? null);
    request.input("isActive", sql.TinyInt, body.isActive ?? 1);
    request.input("String01", sql.VarChar(255), body.String01 ?? null);
    request.input("String02", sql.VarChar(255), body.String02 ?? null);
    request.input("String03", sql.VarChar(255), body.String03 ?? null);
    request.input("Date01", sql.Date, parseUKDate(body.Date01));
    request.input("Date02", sql.Date, parseUKDate(body.Date02));
    request.input("Date03", sql.Date, parseUKDate(body.Date03));
    request.input("Int01", sql.Int, body.Int01 ?? null);
    request.input("Int02", sql.Int, body.Int02 ?? null);
    request.input("Int03", sql.Int, body.Int03 ?? null);
    request.input("Decimal01", sql.Numeric(10, 2), body.Decimal01 ?? null);
    request.input("Decimal02", sql.Numeric(10, 2), body.Decimal02 ?? null);
    request.input("Decimal03", sql.Numeric(10, 2), body.Decimal03 ?? null);
    request.input("Lookup01", sql.Int, body.Lookup01 ?? null);
    request.input("Lookup02", sql.Int, body.Lookup02 ?? null);
    request.input("Lookup03", sql.Int, body.Lookup03 ?? null);
    request.input("Boolean01", sql.TinyInt, body.Boolean01 ?? null);
    request.input("Boolean02", sql.TinyInt, body.Boolean02 ?? null);
    request.input("Boolean03", sql.TinyInt, body.Boolean03 ?? null);
    console.log(
      "Executing usp_InsertPropertyAttribute with inputs:",
      request.parameters
    );
    await request.execute("usp_InsertPropertyAttribute");
    await pool.close();
    console.log("InsertPropertyAttribute success");
    return NextResponse.json({ success: true });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("InsertPropertyAttribute error:", error);
    if (error instanceof Error && error.stack) {
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
