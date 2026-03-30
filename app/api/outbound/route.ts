import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const OUTBOUND_SELECT = `*, owner:User!Outbound_ownerId_fkey(id, name)`;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const response = searchParams.get("response");
  const owner = searchParams.get("owner");

  let query = supabase.from("Outbound").select(OUTBOUND_SELECT);
  if (response) query = query.eq("response", response);
  if (owner) query = query.eq("ownerId", owner);
  query = query.order("createdAt", { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { contact, company, channel, messageSent, sentDate, followUpNum, response, notes, ownerId } = body;
  if (!contact) return NextResponse.json({ error: "Contacto requerido" }, { status: 400 });

  let resolvedOwnerId = ownerId;
  if (!resolvedOwnerId) {
    const { data: users } = await supabase.from("User").select("id").limit(1);
    resolvedOwnerId = users?.[0]?.id;
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("Outbound")
    .insert({
      id: crypto.randomUUID(),
      contact,
      company: company ?? null,
      channel: channel ?? "Email",
      messageSent: messageSent ?? false,
      sentDate: sentDate ? new Date(sentDate).toISOString() : null,
      followUpNum: followUpNum ?? 0,
      response: response ?? "Pendiente",
      notes: notes ?? null,
      ownerId: resolvedOwnerId,
      createdAt: now,
      updatedAt: now,
    })
    .select(OUTBOUND_SELECT)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
