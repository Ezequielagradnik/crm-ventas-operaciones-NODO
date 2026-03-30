import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const allowed = ["contact", "company", "channel", "messageSent", "sentDate", "followUpNum", "response", "notes", "ownerId"];
  const fields = Object.keys(body).filter((k) => allowed.includes(k));
  if (!fields.length) return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  const values = fields.map((f) => f === "sentDate" && body[f] ? new Date(body[f]) : body[f]);
  const sets = fields.map((f, i) => `"${f}" = $${i + 2}`).join(", ");
  const { rows } = await db.query(`
    WITH upd AS (UPDATE "Outbound" SET ${sets}, "updatedAt" = NOW() WHERE id = $1 RETURNING *)
    SELECT u2.*, json_build_object('id', ow.id, 'name', ow.name) AS owner FROM upd u2 LEFT JOIN "User" ow ON u2."ownerId" = ow.id
  `, [id, ...values]);
  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.query(`DELETE FROM "Outbound" WHERE id = $1`, [id]);
  return NextResponse.json({ ok: true });
}
