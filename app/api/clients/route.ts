import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const clients = await prisma.client.findMany({
    where: { ...(status && { status }) },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { company, contact, email, plan, mrr, status, services, nextReview, dealId, notes } = body;

  if (!company || !contact) {
    return NextResponse.json({ error: "Empresa y contacto requeridos" }, { status: 400 });
  }

  const client = await prisma.client.create({
    data: {
      company,
      contact,
      email,
      plan: plan ?? "Starter",
      mrr: mrr ?? 0,
      status: status ?? "Activo",
      services,
      nextReview: nextReview ? new Date(nextReview) : null,
      dealId,
      notes,
    },
  });

  return NextResponse.json(client, { status: 201 });
}
