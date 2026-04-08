import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const SELECT = `*`;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const allowed = ["title", "idea", "platform", "status", "canvaUrl", "hook", "cta", "format", "scheduledAt", "publishedAt"];
  const fields = Object.keys(body).filter((k) => allowed.includes(k));
  if (!fields.length) return NextResponse.json({ error: "No valid fields" }, { status: 400 });

  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  for (const f of fields) {
    if ((f === "scheduledAt" || f === "publishedAt") && body[f]) update[f] = new Date(body[f]).toISOString();
    else update[f] = body[f];
  }

  const { data, error } = await supabase.from("ContentPost").update(update).eq("id", id).select(SELECT).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabase.from("ContentPost").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
