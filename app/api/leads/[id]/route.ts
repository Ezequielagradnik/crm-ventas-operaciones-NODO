import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: lead, error } = await supabase
    .from("Lead")
    .select(`*, owner:User!Lead_ownerId_fkey(id, name)`)
    .eq("id", id)
    .single();

  if (error || !lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [{ data: deals }, { data: tasks }, { data: activities }] = await Promise.all([
    supabase.from("Deal").select(`*, owner:User!Deal_ownerId_fkey(id, name)`).eq("leadId", id).order("createdAt", { ascending: false }),
    supabase.from("Task").select(`*, owner:User!Task_ownerId_fkey(id, name)`).eq("leadId", id).order("createdAt", { ascending: false }),
    supabase.from("Activity").select("*").eq("leadId", id).order("createdAt", { ascending: false }).limit(20),
  ]);

  return NextResponse.json({ ...lead, deals: deals ?? [], tasks: tasks ?? [], activities: activities ?? [] });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: existing, error: fetchErr } = await supabase.from("Lead").select("status").eq("id", id).single();
  if (fetchErr || !existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const allowed = ["name", "company", "email", "phone", "linkedin", "origin", "vertical", "status", "notes", "ownerId"];
  const fields = Object.keys(body).filter((k) => allowed.includes(k));
  if (!fields.length) return NextResponse.json({ error: "No valid fields" }, { status: 400 });

  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  for (const f of fields) update[f] = body[f];

  const { data, error } = await supabase
    .from("Lead")
    .update(update)
    .eq("id", id)
    .select(`*, owner:User!Lead_ownerId_fkey(id, name)`)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (body.status && body.status !== existing.status) {
    await supabase.from("Activity").insert({
      id: crypto.randomUUID(),
      type: "lead_status_changed",
      message: `Estado cambiado a ${body.status}`,
      leadId: id,
      userId: "system",
      createdAt: new Date().toISOString(),
    });
  }

  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await supabase.from("Activity").delete().eq("leadId", id);
  await supabase.from("Task").delete().eq("leadId", id);
  const { error } = await supabase.from("Lead").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
