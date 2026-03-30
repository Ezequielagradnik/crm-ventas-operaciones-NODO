import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const response = searchParams.get("response");
  const owner = searchParams.get("owner");

  const outbounds = await prisma.outbound.findMany({
    where: {
      ...(response && { response }),
      ...(owner && { ownerId: owner }),
    },
    include: { owner: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(outbounds);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { contact, company, channel, messageSent, sentDate, followUpNum, response, notes, ownerId } = body;

  if (!contact) return NextResponse.json({ error: "Contacto requerido" }, { status: 400 });

  const users = await prisma.user.findMany({ select: { id: true } });
  const resolvedOwnerId = ownerId ?? session.user?.id ?? users[0]?.id;

  const outbound = await prisma.outbound.create({
    data: {
      contact,
      company,
      channel: channel ?? "Email",
      messageSent: messageSent ?? false,
      sentDate: sentDate ? new Date(sentDate) : null,
      followUpNum: followUpNum ?? 0,
      response: response ?? "Pendiente",
      notes,
      ownerId: resolvedOwnerId,
    },
    include: { owner: { select: { id: true, name: true } } },
  });

  return NextResponse.json(outbound, { status: 201 });
}
