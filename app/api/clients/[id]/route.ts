import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [{ data: client, error }, { data: activities }] = await Promise.all([
    supabase.from("Client").select("*").eq("id", id).single(),
    supabase.from("Activity").select("*").eq("clientId", id).order("createdAt", { ascending: false }).limit(20),
  ]);

  if (error || !client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...client, activities: activities ?? [] });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const allowed = ["company", "contact", "email", "plan", "mrr", "status", "services", "nextReview", "dealId", "notes"];
  const fields = Object.keys(body).filter((k) => allowed.includes(k));
  if (!fields.length) return NextResponse.json({ error: "No valid fields" }, { status: 400 });

  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  for (const f of fields) {
    update[f] = f === "nextReview" && body[f] ? new Date(body[f]).toISOString() : body[f];
  }

  const { data, error } = await supabase.from("Client").update(update).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await supabase.from("Activity").delete().eq("clientId", id);
  const { error } = await supabase.from("Client").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
