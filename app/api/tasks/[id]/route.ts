import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const TASK_SELECT = `*, owner:User!Task_ownerId_fkey(id, name), lead:Lead!Task_leadId_fkey(id, name), deal:Deal!Task_dealId_fkey(id, company)`;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const allowed = ["title", "description", "priority", "status", "dueDate", "ownerId", "leadId", "dealId"];
  const fields = Object.keys(body).filter((k) => allowed.includes(k));
  if (!fields.length) return NextResponse.json({ error: "No valid fields" }, { status: 400 });

  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  for (const f of fields) {
    update[f] = f === "dueDate" && body[f] ? new Date(body[f]).toISOString() : body[f];
  }

  const { data, error } = await supabase
    .from("Task")
    .update(update)
    .eq("id", id)
    .select(TASK_SELECT)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabase.from("Task").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
