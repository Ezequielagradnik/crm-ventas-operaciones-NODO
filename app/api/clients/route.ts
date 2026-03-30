import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let query = supabase.from("Client").select("*");
  if (status) query = query.eq("status", status);
  query = query.order("createdAt", { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { company, contact, email, plan, mrr, status, services, nextReview, dealId, notes } = body;
  if (!company || !contact) return NextResponse.json({ error: "Empresa y contacto requeridos" }, { status: 400 });

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("Client")
    .insert({
      id: crypto.randomUUID(),
      company,
      contact,
      email: email ?? null,
      plan: plan ?? "Starter",
      mrr: mrr ?? 0,
      status: status ?? "Activo",
      services: services ?? null,
      nextReview: nextReview ? new Date(nextReview).toISOString() : null,
      dealId: dealId ?? null,
      notes: notes ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
