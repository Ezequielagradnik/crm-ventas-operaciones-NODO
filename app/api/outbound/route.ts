import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const response = searchParams.get("response");
  const owner = searchParams.get("owner");
  const conditions: string[] = [];
  const params: unknown[] = [];
  if (response) { params.push(response); conditions.push(`o.response = $${params.length}`); }
  if (owner) { params.push(owner); conditions.push(`o."ownerId" = $${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await db.query(`
    SELECT o.*, json_build_object('id', u.id, 'name', u.name) AS owner
    FROM "Outbound" o LEFT JOIN "User" u ON o."ownerId" = u.id ${where} ORDER BY o."createdAt" DESC
  `, params);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { contact, company, channel, messageSent, sentDate, followUpNum, response, notes, ownerId } = body;
  if (!contact) return NextResponse.json({ error: "Contacto requerido" }, { status: 400 });
  const usersRes = await db.query(`SELECT id FROM "User" LIMIT 1`);
  const resolvedOwnerId = ownerId ?? usersRes.rows[0]?.id;
  const { rows } = await db.query(`
    WITH ins AS (
      INSERT INTO "Outbound" (id, contact, company, channel, "messageSent", "sentDate", "followUpNum", response, notes, "ownerId", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING *
    )
    SELECT i.*, json_build_object('id', u.id, 'name', u.name) AS owner FROM ins i LEFT JOIN "User" u ON i."ownerId" = u.id
  `, [contact, company??null, channel??"Email", messageSent??false, sentDate?new Date(sentDate):null, followUpNum??0, response??"Pendiente", notes??null, resolvedOwnerId]);
  return NextResponse.json(rows[0], { status: 201 });
}
