import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const params: unknown[] = [];
  const where = status ? (params.push(status), `WHERE status = $1`) : "";
  const { rows } = await db.query(`SELECT * FROM "Client" ${where} ORDER BY "createdAt" DESC`, params);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { company, contact, email, plan, mrr, status, services, nextReview, dealId, notes } = body;
  if (!company || !contact) return NextResponse.json({ error: "Empresa y contacto requeridos" }, { status: 400 });
  const { rows } = await db.query(`
    INSERT INTO "Client" (id, company, contact, email, plan, mrr, status, services, "nextReview", "dealId", notes, "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING *
  `, [company, contact, email??null, plan??"Starter", mrr??0, status??"Activo", services??null, nextReview?new Date(nextReview):null, dealId??null, notes??null]);
  return NextResponse.json(rows[0], { status: 201 });
}
