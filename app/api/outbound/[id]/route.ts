import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const outbound = await prisma.outbound.update({
    where: { id },
    data: { ...body, ...(body.sentDate && { sentDate: new Date(body.sentDate) }) },
    include: { owner: { select: { id: true, name: true } } },
  });
  return NextResponse.json(outbound);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.outbound.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
