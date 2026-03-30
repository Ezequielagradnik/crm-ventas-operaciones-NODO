import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const [leads, deals, clients, tasks] = await Promise.all([
    prisma.lead.findMany({
      where: { OR: [{ name: { contains: q } }, { company: { contains: q } }, { email: { contains: q } }] },
      take: 5,
      select: { id: true, name: true, company: true },
    }),
    prisma.deal.findMany({
      where: { company: { contains: q } },
      take: 5,
      select: { id: true, company: true, stage: true },
    }),
    prisma.client.findMany({
      where: { OR: [{ company: { contains: q } }, { contact: { contains: q } }] },
      take: 5,
      select: { id: true, company: true, contact: true },
    }),
    prisma.task.findMany({
      where: { title: { contains: q } },
      take: 5,
      select: { id: true, title: true, status: true },
    }),
  ]);

  const results = [
    ...leads.map((l) => ({ id: l.id, type: "lead" as const, title: l.name, subtitle: l.company ?? undefined, href: `/leads/${l.id}` })),
    ...deals.map((d) => ({ id: d.id, type: "deal" as const, title: d.company, subtitle: d.stage, href: `/deals` })),
    ...clients.map((c) => ({ id: c.id, type: "client" as const, title: c.company, subtitle: c.contact, href: `/clientes` })),
    ...tasks.map((t) => ({ id: t.id, type: "task" as const, title: t.title, subtitle: t.status, href: `/tareas` })),
  ];

  return NextResponse.json({ results });
}
