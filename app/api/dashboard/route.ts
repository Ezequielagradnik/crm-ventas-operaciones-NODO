import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);

  const [newLeads, deals, activeClients, tasks, activities, todayTasks] = await Promise.all([
    prisma.lead.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.deal.findMany({
      where: { stage: { not: "Cerrado perdido" } },
      select: { value: true, stage: true },
    }),
    prisma.client.findMany({
      where: { status: "Activo" },
      select: { mrr: true },
    }),
    prisma.task.count({ where: { status: { not: "Completada" } } }),
    prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { id: true, name: true } },
        lead: { select: { id: true, name: true } },
        deal: { select: { id: true, company: true } },
      },
    }),
    prisma.task.findMany({
      where: {
        status: { not: "Completada" },
        dueDate: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        },
      },
      include: { owner: { select: { id: true, name: true } } },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
  ]);

  const pipelineValue = deals.reduce((sum: number, d) => sum + d.value, 0);
  const mrr = activeClients.reduce((sum: number, c) => sum + c.mrr, 0);

  const stageBreakdown = deals.reduce<Record<string, number>>((acc, d) => {
    acc[d.stage] = (acc[d.stage] ?? 0) + d.value;
    return acc;
  }, {});

  return NextResponse.json({
    kpis: {
      newLeads,
      pipelineValue,
      activeClients: activeClients.length,
      mrr,
      pendingTasks: tasks,
    },
    stageBreakdown,
    recentActivity: activities,
    todayTasks,
  });
}
