import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const leadRes = await db.query(`
    SELECT l.*, json_build_object('id', u.id, 'name', u.name) AS owner
    FROM "Lead" l
    LEFT JOIN "User" u ON l."ownerId" = u.id
    WHERE l.id = $1
  `, [id]);

  if (!leadRes.rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [dealsRes, tasksRes, activitiesRes] = await Promise.all([
    db.query(`
      SELECT d.*, json_build_object('id', u.id, 'name', u.name) AS owner
      FROM "Deal" d
      LEFT JOIN "User" u ON d."ownerId" = u.id
      WHERE d."leadId" = $1
      ORDER BY d."createdAt" DESC
    `, [id]),
    db.query(`
      SELECT t.*, json_build_object('id', u.id, 'name', u.name) AS owner
      FROM "Task" t
      LEFT JOIN "User" u ON t."ownerId" = u.id
      WHERE t."leadId" = $1
      ORDER BY t."createdAt" DESC
    `, [id]),
    db.query(`SELECT * FROM "Activity" WHERE "leadId" = $1 ORDER BY "createdAt" DESC LIMIT 20`, [id]),
  ]);

  const lead = {
    ...leadRes.rows[0],
    deals: dealsRes.rows,
    tasks: tasksRes.rows,
    activities: activitiesRes.rows,
  };

  return NextResponse.json(lead);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await db.query(`SELECT status FROM "Lead" WHERE id = $1`, [id]);
  if (!existing.rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const allowed = ["name", "company", "email", "phone", "linkedin", "origin", "vertical", "status", "notes", "ownerId"];
  const fields = Object.keys(body).filter((k) => allowed.includes(k));
  if (!fields.length) return NextResponse.json({ error: "No valid fields" }, { status: 400 });

  const sets = fields.map((f, i) => `"${f}" = $${i + 2}`).join(", ");
  const values = fields.map((f) => body[f]);

  const { rows } = await db.query(`
    WITH upd AS (
      UPDATE "Lead" SET ${sets}, "updatedAt" = NOW() WHERE id = $1 RETURNING *
    )
    SELECT u2.*, json_build_object('id', ow.id, 'name', ow.name) AS owner
    FROM upd u2
    LEFT JOIN "User" ow ON u2."ownerId" = ow.id
  `, [id, ...values]);

  if (body.status && body.status !== existing.rows[0].status) {
    await db.query(`
      INSERT INTO "Activity" (id, type, message, "leadId", "userId", "createdAt")
      VALUES (gen_random_uuid()::text, 'lead_status_changed', $1, $2, $3, NOW())
    `, [`Estado cambiado a ${body.status}`, id, session.user?.id ?? "system"]);
  }

  return NextResponse.json(rows[0]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  await db.query(`DELETE FROM "Activity" WHERE "leadId" = $1`, [id]);
  await db.query(`DELETE FROM "Task" WHERE "leadId" = $1`, [id]);
  await db.query(`DELETE FROM "Lead" WHERE id = $1`, [id]);

  return NextResponse.json({ ok: true });
}
