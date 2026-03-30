import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const owner = searchParams.get("owner");
  const origin = searchParams.get("origin");
  const search = searchParams.get("search");

  const leads = await prisma.lead.findMany({
    where: {
      ...(status && { status }),
      ...(owner && { ownerId: owner }),
      ...(origin && { origin }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { company: { contains: search } },
          { email: { contains: search } },
        ],
      }),
    },
    include: { owner: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, company, email, phone, linkedin, origin, vertical, status, notes, ownerId } = body;

  if (!name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

  const users = await prisma.user.findMany({ select: { id: true } });
  const resolvedOwnerId = ownerId ?? session.user?.id ?? users[0]?.id;

  const lead = await prisma.lead.create({
    data: { name, company, email, phone, linkedin, origin, vertical, status, notes, ownerId: resolvedOwnerId },
    include: { owner: { select: { id: true, name: true } } },
  });

  await prisma.activity.create({
    data: {
      type: "lead_created",
      message: `Lead creado: ${lead.name}${lead.company ? ` (${lead.company})` : ""}`,
      leadId: lead.id,
      userId: resolvedOwnerId,
    },
  });

  return NextResponse.json(lead, { status: 201 });
}
