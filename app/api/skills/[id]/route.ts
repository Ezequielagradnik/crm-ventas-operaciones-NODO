import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const SKILL_SELECT = `*, addedBy:User!ClaudeSkill_addedBy_fkey(id, name)`;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const allowed = ["title", "description", "url", "category", "tags"];
  const fields = Object.keys(body).filter((k) => allowed.includes(k));
  if (!fields.length) return NextResponse.json({ error: "No valid fields" }, { status: 400 });

  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  for (const f of fields) update[f] = body[f];

  const { data, error } = await supabase
    .from("ClaudeSkill")
    .update(update)
    .eq("id", id)
    .select(SKILL_SELECT)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabase.from("ClaudeSkill").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
