import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const SELECT = `*, createdBy:User!MessageTemplate_createdBy_fkey(id, name)`;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get("channel");
  const category = searchParams.get("category");

  let query = supabase.from("MessageTemplate").select(SELECT);
  if (channel) query = query.eq("channel", channel);
  if (category) query = query.eq("category", category);
  query = query.order("createdAt", { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, channel, body: msgBody, category, createdBy } = body;
  if (!title || !msgBody) return NextResponse.json({ error: "Título y mensaje requeridos" }, { status: 400 });

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("MessageTemplate")
    .insert({
      id: crypto.randomUUID(),
      title,
      channel: channel ?? "LinkedIn",
      body: msgBody,
      category: category ?? "Primer contacto",
      createdBy: createdBy ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .select(SELECT)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
