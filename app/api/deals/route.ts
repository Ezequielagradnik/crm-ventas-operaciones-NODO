import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const stage = searchParams.get("stage");

  const deals = await prisma.deal.findMany({
    where: { ...(stage && { stage }) },
    include: {
      owner: { select: { id: true, name: true } },
      lead: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(deals);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { company, value, service, stage, ownerId, leadId, notes } = body;

  if (!company || !service) {
    return NextResponse.json({ error: "Empresa y servicio requeridos" }, { status: 400 });
  }

  const users = await prisma.user.findMany({ select: { id: true } });
  const resolvedOwnerId = ownerId ?? session.user?.id ?? users[0]?.id;

  const deal = await prisma.deal.create({
    data: { company, value: value ?? 0, service, stage: stage ?? "Nuevo contacto", ownerId: resolvedOwnerId, leadId, notes },
    include: {
      owner: { select: { id: true, name: true } },
      lead: { select: { id: true, name: true } },
    },
  });

  await prisma.activity.create({
    data: {
      type: "deal_created",
      message: `Deal creado: ${deal.company}`,
      dealId: deal.id,
      userId: resolvedOwnerId,
    },
  });

  return NextResponse.json(deal, { status: 201 });
}
