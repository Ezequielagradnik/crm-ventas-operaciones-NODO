import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const DEAL_SELECT = `*, owner:User!Deal_ownerId_fkey(id, name), lead:Lead!Deal_leadId_fkey(id, name)`;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: deal, error } = await supabase.from("Deal").select(DEAL_SELECT).eq("id", id).single();
  if (error || !deal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [{ data: tasks }, { data: activities }] = await Promise.all([
    supabase.from("Task").select(`*, owner:User!Task_ownerId_fkey(id, name)`).eq("dealId", id),
    supabase.from("Activity").select("*").eq("dealId", id).order("createdAt", { ascending: false }).limit(20),
  ]);

  return NextResponse.json({ ...deal, tasks: tasks ?? [], activities: activities ?? [] });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: existing, error: fetchErr } = await supabase.from("Deal").select("stage, leadId, company").eq("id", id).single();
  if (fetchErr || !existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const isStageChange = body.stage && body.stage !== existing.stage;
  const allowed = ["company", "value", "service", "stage", "ownerId", "leadId", "notes"];
  const fields = Object.keys(body).filter((k) => allowed.includes(k));
  if (!fields.length) return NextResponse.json({ error: "No valid fields" }, { status: 400 });

  const now = new Date().toISOString();
  const update: Record<string, unknown> = { updatedAt: now };
  for (const f of fields) update[f] = body[f];
  if (isStageChange) update.stageMovedAt = now;

  const { data: deal, error } = await supabase
    .from("Deal")
    .update(update)
    .eq("id", id)
    .select(DEAL_SELECT)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (isStageChange) {
    await supabase.from("Activity").insert({
      id: crypto.randomUUID(),
      type: "deal_moved",
      message: `Deal movido a "${body.stage}"`,
      dealId: id,
      userId: "system",
      createdAt: now,
    });

    if (body.stage === "Cerrado ganado") {
      const { data: existing_client } = await supabase.from("Client").select("id").eq("dealId", id).limit(1).single();
      if (!existing_client) {
        let contactName: string | null = null;
        if (existing.leadId) {
          const { data: lead } = await supabase.from("Lead").select("name").eq("id", existing.leadId).single();
          contactName = lead?.name ?? null;
        }
        await supabase.from("Client").insert({
          id: crypto.randomUUID(),
          company: deal.company,
          contact: contactName ?? deal.company,
          dealId: id,
          status: "Activo",
          plan: "Starter",
          mrr: 0,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  }

  return NextResponse.json(deal);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await supabase.from("Activity").delete().eq("dealId", id);
  await supabase.from("Task").delete().eq("dealId", id);
  const { error } = await supabase.from("Deal").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
