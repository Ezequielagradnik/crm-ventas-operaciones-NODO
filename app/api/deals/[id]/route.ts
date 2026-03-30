import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
      lead: { select: { id: true, name: true } },
      tasks: { include: { owner: { select: { id: true, name: true } } } },
      activities: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(deal);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await req.json();
  const existing = await prisma.deal.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isStageChange = body.stage && body.stage !== existing.stage;

  const deal = await prisma.deal.update({
    where: { id },
    data: {
      ...body,
      ...(isStageChange && { stageMovedAt: new Date() }),
    },
    include: {
      owner: { select: { id: true, name: true } },
      lead: { select: { id: true, name: true } },
    },
  });

  if (isStageChange) {
    await prisma.activity.create({
      data: {
        type: "deal_moved",
        message: `Deal movido a "${body.stage}"`,
        dealId: id,
        userId: session.user?.id ?? "system",
      },
    });

    // Auto-create client if deal won
    if (body.stage === "Cerrado ganado") {
      const existingClient = await prisma.client.findFirst({ where: { dealId: id } });
      if (!existingClient) {
        await prisma.client.create({
          data: {
            company: deal.company,
            contact: deal.lead?.name ?? deal.company,
            dealId: deal.id,
            status: "Activo",
          },
        });
      }
    }
  }

  return NextResponse.json(deal);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  await prisma.activity.deleteMany({ where: { dealId: id } });
  await prisma.task.deleteMany({ where: { dealId: id } });
  await prisma.deal.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
