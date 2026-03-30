import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const [clientRes, activitiesRes] = await Promise.all([
    db.query(`SELECT * FROM "Client" WHERE id = $1`, [id]),
    db.query(`SELECT * FROM "Activity" WHERE "clientId" = $1 ORDER BY "createdAt" DESC LIMIT 20`, [id]),
  ]);

  if (!clientRes.rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ...clientRes.rows[0], activities: activitiesRes.rows });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await req.json();
  const allowed = ["company", "contact", "email", "plan", "mrr", "status", "services", "nextReview", "dealId", "notes"];
  const fields = Object.keys(body).filter((k) => allowed.includes(k));
  if (!fields.length) return NextResponse.json({ error: "No valid fields" }, { status: 400 });

  const values = fields.map((f) => f === "nextReview" && body[f] ? new Date(body[f]) : body[f]);
  const sets = fields.map((f, i) => `"${f}" = $${i + 2}`).join(", ");

  const { rows } = await db.query(
    `UPDATE "Client" SET ${sets}, "updatedAt" = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );

  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  await db.query(`DELETE FROM "Activity" WHERE "clientId" = $1`, [id]);
  await db.query(`DELETE FROM "Client" WHERE id = $1`, [id]);

  return NextResponse.json({ ok: true });
}
