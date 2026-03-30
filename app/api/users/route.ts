export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const { rows } = await db.query(`SELECT id, name, email FROM "User" ORDER BY name ASC`);
  return NextResponse.json(rows);
}
