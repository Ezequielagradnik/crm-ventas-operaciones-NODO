import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const status = searchParams.get("status");
  const today = searchParams.get("today");

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (owner) { params.push(owner); conditions.push(`t."ownerId" = $${params.length}`); }
  if (status) { params.push(status); conditions.push(`t.status = $${params.length}`); }
  if (today === "1") {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start.getTime() + 86400000);
    params.push(start, end);
    conditions.push(`t."dueDate" >= $${params.length - 1} AND t."dueDate" < $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await db.query(`
    SELECT t.*, json_build_object('id', u.id, 'name', u.name) AS owner,
      CASE WHEN t."leadId" IS NOT NULL THEN json_build_object('id', l.id, 'name', l.name) ELSE NULL END AS lead,
      CASE WHEN t."dealId" IS NOT NULL THEN json_build_object('id', d.id, 'company', d.company) ELSE NULL END AS deal
    FROM "Task" t LEFT JOIN "User" u ON t."ownerId" = u.id
    LEFT JOIN "Lead" l ON t."leadId" = l.id LEFT JOIN "Deal" d ON t."dealId" = d.id
    ${where} ORDER BY t."dueDate" ASC NULLS LAST, t."createdAt" DESC
  `, params);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, priority, status, dueDate, ownerId, leadId, dealId } = body;
  if (!title) return NextResponse.json({ error: "Título requerido" }, { status: 400 });

  const usersRes = await db.query(`SELECT id FROM "User" LIMIT 1`);
  const resolvedOwnerId = ownerId ?? usersRes.rows[0]?.id;

  const { rows } = await db.query(`
    WITH ins AS (
      INSERT INTO "Task" (id, title, description, priority, status, "dueDate", "ownerId", "leadId", "dealId", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING *
    )
    SELECT i.*, json_build_object('id', u.id, 'name', u.name) AS owner,
      CASE WHEN i."leadId" IS NOT NULL THEN json_build_object('id', l.id, 'name', l.name) ELSE NULL END AS lead,
      CASE WHEN i."dealId" IS NOT NULL THEN json_build_object('id', d.id, 'company', d.company) ELSE NULL END AS deal
    FROM ins i LEFT JOIN "User" u ON i."ownerId" = u.id
    LEFT JOIN "Lead" l ON i."leadId" = l.id LEFT JOIN "Deal" d ON i."dealId" = d.id
  `, [title, description??null, priority??"Media", status??"Pendiente", dueDate?new Date(dueDate):null, resolvedOwnerId, leadId??null, dealId??null]);
  return NextResponse.json(rows[0], { status: 201 });
}
