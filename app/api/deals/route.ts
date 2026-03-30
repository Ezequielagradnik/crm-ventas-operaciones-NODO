import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const stage = searchParams.get("stage");

  const params: unknown[] = [];
  const where = stage ? (params.push(stage), `WHERE d.stage = $1`) : "";

  const { rows } = await db.query(`
    SELECT d.*,
      json_build_object('id', u.id, 'name', u.name) AS owner,
      CASE WHEN d."leadId" IS NOT NULL THEN json_build_object('id', l.id, 'name', l.name) ELSE NULL END AS lead
    FROM "Deal" d
    LEFT JOIN "User" u ON d."ownerId" = u.id
    LEFT JOIN "Lead" l ON d."leadId" = l.id
    ${where}
    ORDER BY d."createdAt" DESC
  `, params);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { company, value, service, stage, ownerId, leadId, notes } = body;

  if (!company || !service) {
    return NextResponse.json({ error: "Empresa y servicio requeridos" }, { status: 400 });
  }

  const usersRes = await db.query(`SELECT id FROM "User" LIMIT 1`);
  const resolvedOwnerId = ownerId ?? session.user?.id ?? usersRes.rows[0]?.id;

  const { rows } = await db.query(`
    WITH ins AS (
      INSERT INTO "Deal" (id, company, value, service, stage, "ownerId", "leadId", notes, "stageMovedAt", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), NOW())
      RETURNING *
    )
    SELECT i.*,
      json_build_object('id', u.id, 'name', u.name) AS owner,
      CASE WHEN i."leadId" IS NOT NULL THEN json_build_object('id', l.id, 'name', l.name) ELSE NULL END AS lead
    FROM ins i
    LEFT JOIN "User" u ON i."ownerId" = u.id
    LEFT JOIN "Lead" l ON i."leadId" = l.id
  `, [company, value ?? 0, service, stage ?? "Nuevo contacto", resolvedOwnerId, leadId ?? null, notes ?? null]);

  const deal = rows[0];

  await db.query(`
    INSERT INTO "Activity" (id, type, message, "dealId", "userId", "createdAt")
    VALUES (gen_random_uuid()::text, 'deal_created', $1, $2, $3, NOW())
  `, [`Deal creado: ${deal.company}`, deal.id, resolvedOwnerId]);

  return NextResponse.json(deal, { status: 201 });
}
