import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dealRes = await db.query(`
    SELECT d.*, json_build_object('id', u.id, 'name', u.name) AS owner,
      CASE WHEN d."leadId" IS NOT NULL THEN json_build_object('id', l.id, 'name', l.name) ELSE NULL END AS lead
    FROM "Deal" d LEFT JOIN "User" u ON d."ownerId" = u.id LEFT JOIN "Lead" l ON d."leadId" = l.id WHERE d.id = $1
  `, [id]);
  if (!dealRes.rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [tasksRes, activitiesRes] = await Promise.all([
    db.query(`SELECT t.*, json_build_object('id', u.id, 'name', u.name) AS owner FROM "Task" t LEFT JOIN "User" u ON t."ownerId" = u.id WHERE t."dealId" = $1`, [id]),
    db.query(`SELECT * FROM "Activity" WHERE "dealId" = $1 ORDER BY "createdAt" DESC LIMIT 20`, [id]),
  ]);
  return NextResponse.json({ ...dealRes.rows[0], tasks: tasksRes.rows, activities: activitiesRes.rows });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await db.query(`SELECT stage, "leadId", company FROM "Deal" WHERE id = $1`, [id]);
  if (!existing.rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const isStageChange = body.stage && body.stage !== existing.rows[0].stage;
  const allowed = ["company", "value", "service", "stage", "ownerId", "leadId", "notes"];
  const fields = Object.keys(body).filter((k) => allowed.includes(k));
  if (!fields.length) return NextResponse.json({ error: "No valid fields" }, { status: 400 });

  const sets = fields.map((f, i) => `"${f}" = $${i + 2}`).join(", ");
  const extra = isStageChange ? `, "stageMovedAt" = NOW()` : "";
  const { rows } = await db.query(`
    WITH upd AS (UPDATE "Deal" SET ${sets}${extra}, "updatedAt" = NOW() WHERE id = $1 RETURNING *)
    SELECT u2.*, json_build_object('id', ow.id, 'name', ow.name) AS owner,
      CASE WHEN u2."leadId" IS NOT NULL THEN json_build_object('id', l.id, 'name', l.name) ELSE NULL END AS lead
    FROM upd u2 LEFT JOIN "User" ow ON u2."ownerId" = ow.id LEFT JOIN "Lead" l ON u2."leadId" = l.id
  `, [id, ...fields.map((f) => body[f])]);

  const deal = rows[0];
  if (isStageChange) {
    await db.query(`INSERT INTO "Activity" (id, type, message, "dealId", "userId", "createdAt") VALUES (gen_random_uuid()::text, 'deal_moved', $1, $2, 'system', NOW())`,
      [`Deal movido a "${body.stage}"`, id]);
    if (body.stage === "Cerrado ganado") {
      const check = await db.query(`SELECT id FROM "Client" WHERE "dealId" = $1 LIMIT 1`, [id]);
      if (!check.rows[0]) {
        const contactName = existing.rows[0].leadId
          ? (await db.query(`SELECT name FROM "Lead" WHERE id = $1`, [existing.rows[0].leadId])).rows[0]?.name
          : null;
        await db.query(`INSERT INTO "Client" (id, company, contact, "dealId", status, plan, mrr, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3, 'Activo', 'Starter', 0, NOW(), NOW())`,
          [deal.company, contactName ?? deal.company, id]);
      }
    }
  }
  return NextResponse.json(deal);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.query(`DELETE FROM "Activity" WHERE "dealId" = $1`, [id]);
  await db.query(`DELETE FROM "Task" WHERE "dealId" = $1`, [id]);
  await db.query(`DELETE FROM "Deal" WHERE id = $1`, [id]);
  return NextResponse.json({ ok: true });
}
