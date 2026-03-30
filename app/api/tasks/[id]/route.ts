import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await req.json();
  const allowed = ["title", "description", "priority", "status", "dueDate", "ownerId", "leadId", "dealId"];
  const fields = Object.keys(body).filter((k) => allowed.includes(k));
  if (!fields.length) return NextResponse.json({ error: "No valid fields" }, { status: 400 });

  const values = fields.map((f) => f === "dueDate" && body[f] ? new Date(body[f]) : body[f]);
  const sets = fields.map((f, i) => `"${f}" = $${i + 2}`).join(", ");

  const { rows } = await db.query(`
    WITH upd AS (
      UPDATE "Task" SET ${sets}, "updatedAt" = NOW() WHERE id = $1 RETURNING *
    )
    SELECT u2.*,
      json_build_object('id', ow.id, 'name', ow.name) AS owner,
      CASE WHEN u2."leadId" IS NOT NULL THEN json_build_object('id', l.id, 'name', l.name) ELSE NULL END AS lead,
      CASE WHEN u2."dealId" IS NOT NULL THEN json_build_object('id', d.id, 'company', d.company) ELSE NULL END AS deal
    FROM upd u2
    LEFT JOIN "User" ow ON u2."ownerId" = ow.id
    LEFT JOIN "Lead" l ON u2."leadId" = l.id
    LEFT JOIN "Deal" d ON u2."dealId" = d.id
  `, [id, ...values]);

  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  await db.query(`DELETE FROM "Task" WHERE id = $1`, [id]);

  return NextResponse.json({ ok: true });
}
