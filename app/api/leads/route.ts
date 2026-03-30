import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const owner = searchParams.get("owner");
  const origin = searchParams.get("origin");
  const search = searchParams.get("search");

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status) { params.push(status); conditions.push(`l.status = $${params.length}`); }
  if (owner) { params.push(owner); conditions.push(`l."ownerId" = $${params.length}`); }
  if (origin) { params.push(origin); conditions.push(`l.origin = $${params.length}`); }
  if (search) {
    params.push(`%${search}%`);
    const n = params.length;
    conditions.push(`(l.name ILIKE $${n} OR l.company ILIKE $${n} OR l.email ILIKE $${n})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const { rows } = await db.query(`
    SELECT l.*,
      json_build_object('id', u.id, 'name', u.name) AS owner
    FROM "Lead" l
    LEFT JOIN "User" u ON l."ownerId" = u.id
    ${where}
    ORDER BY l."createdAt" DESC
  `, params);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, company, email, phone, linkedin, origin, vertical, status, notes, ownerId } = body;

  if (!name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

  const usersRes = await db.query(`SELECT id FROM "User" LIMIT 1`);
  const resolvedOwnerId = ownerId ?? session.user?.id ?? usersRes.rows[0]?.id;

  const { rows } = await db.query(`
    WITH ins AS (
      INSERT INTO "Lead" (id, name, company, email, phone, linkedin, origin, vertical, status, notes, "ownerId", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *
    )
    SELECT i.*, json_build_object('id', u.id, 'name', u.name) AS owner
    FROM ins i
    LEFT JOIN "User" u ON i."ownerId" = u.id
  `, [name, company ?? null, email ?? null, phone ?? null, linkedin ?? null,
      origin ?? "Otro", vertical ?? "Otro", status ?? "Nuevo", notes ?? null, resolvedOwnerId]);

  const lead = rows[0];

  await db.query(`
    INSERT INTO "Activity" (id, type, message, "leadId", "userId", "createdAt")
    VALUES (gen_random_uuid()::text, 'lead_created', $1, $2, $3, NOW())
  `, [`Lead creado: ${lead.name}${lead.company ? ` (${lead.company})` : ""}`, lead.id, resolvedOwnerId]);

  return NextResponse.json(lead, { status: 201 });
}
