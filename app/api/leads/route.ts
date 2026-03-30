import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const LEAD_SELECT = `*, owner:User!Lead_ownerId_fkey(id, name)`;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const owner = searchParams.get("owner");
  const origin = searchParams.get("origin");
  const search = searchParams.get("search");

  let query = supabase.from("Lead").select(LEAD_SELECT);

  if (status) query = query.eq("status", status);
  if (owner) query = query.eq("ownerId", owner);
  if (origin) query = query.eq("origin", origin);
  if (search) {
    query = query.or(`name.ilike.%${search}%,company.ilike.%${search}%,email.ilike.%${search}%`);
  }

  query = query.order("createdAt", { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, company, email, phone, linkedin, origin, vertical, status, notes, ownerId } = body;
  if (!name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

  let resolvedOwnerId = ownerId;
  if (!resolvedOwnerId) {
    const { data: users } = await supabase.from("User").select("id").limit(1);
    resolvedOwnerId = users?.[0]?.id;
  }

  const now = new Date().toISOString();
  const { data: lead, error } = await supabase
    .from("Lead")
    .insert({
      id: crypto.randomUUID(),
      name,
      company: company ?? null,
      email: email ?? null,
      phone: phone ?? null,
      linkedin: linkedin ?? null,
      origin: origin ?? "Otro",
      vertical: vertical ?? "Otro",
      status: status ?? "Nuevo",
      notes: notes ?? null,
      ownerId: resolvedOwnerId,
      createdAt: now,
      updatedAt: now,
    })
    .select(LEAD_SELECT)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("Activity").insert({
    id: crypto.randomUUID(),
    type: "lead_created",
    message: `Lead creado: ${lead.name}${lead.company ? ` (${lead.company})` : ""}`,
    leadId: lead.id,
    userId: resolvedOwnerId,
    createdAt: now,
  });

  return NextResponse.json(lead, { status: 201 });
}
