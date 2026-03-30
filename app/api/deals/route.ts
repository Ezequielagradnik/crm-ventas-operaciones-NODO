import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const DEAL_SELECT = `*, owner:User!Deal_ownerId_fkey(id, name), lead:Lead!Deal_leadId_fkey(id, name)`;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stage = searchParams.get("stage");

  let query = supabase.from("Deal").select(DEAL_SELECT);
  if (stage) query = query.eq("stage", stage);
  query = query.order("createdAt", { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { company, value, service, stage, ownerId, leadId, notes } = body;
  if (!company || !service) return NextResponse.json({ error: "Empresa y servicio requeridos" }, { status: 400 });

  let resolvedOwnerId = ownerId;
  if (!resolvedOwnerId) {
    const { data: users } = await supabase.from("User").select("id").limit(1);
    resolvedOwnerId = users?.[0]?.id;
  }

  const now = new Date().toISOString();
  const { data: deal, error } = await supabase
    .from("Deal")
    .insert({
      id: crypto.randomUUID(),
      company,
      value: value ?? 0,
      service,
      stage: stage ?? "Nuevo contacto",
      ownerId: resolvedOwnerId,
      leadId: leadId ?? null,
      notes: notes ?? null,
      stageMovedAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .select(DEAL_SELECT)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("Activity").insert({
    id: crypto.randomUUID(),
    type: "deal_created",
    message: `Deal creado: ${deal.company}`,
    dealId: deal.id,
    userId: resolvedOwnerId,
    createdAt: now,
  });

  return NextResponse.json(deal, { status: 201 });
}
