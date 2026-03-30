import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const status = searchParams.get("status");
  const today = searchParams.get("today");

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000);

  const tasks = await prisma.task.findMany({
    where: {
      ...(owner && { ownerId: owner }),
      ...(status && { status }),
      ...(today === "1" && { dueDate: { gte: todayStart, lt: todayEnd } }),
    },
    include: {
      owner: { select: { id: true, name: true } },
      lead: { select: { id: true, name: true } },
      deal: { select: { id: true, company: true } },
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, priority, status, dueDate, ownerId, leadId, dealId } = body;

  if (!title) return NextResponse.json({ error: "Título requerido" }, { status: 400 });

  const users = await prisma.user.findMany({ select: { id: true } });
  const resolvedOwnerId = ownerId ?? session.user?.id ?? users[0]?.id;

  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority: priority ?? "Media",
      status: status ?? "Pendiente",
      dueDate: dueDate ? new Date(dueDate) : null,
      ownerId: resolvedOwnerId,
      leadId,
      dealId,
    },
    include: {
      owner: { select: { id: true, name: true } },
      lead: { select: { id: true, name: true } },
      deal: { select: { id: true, company: true } },
    },
  });

  return NextResponse.json(task, { status: 201 });
}
