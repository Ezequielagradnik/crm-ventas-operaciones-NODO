import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const category = searchParams.get("category");

  let query = supabase.from("Cost").select("*");
  if (type) query = query.eq("type", type);
  if (category) query = query.eq("category", category);
  query = query.order("createdAt", { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, amount, currency, type, category, frequency, notes, paidAt } = body;
  if (!name || amount === undefined) return NextResponse.json({ error: "Nombre y monto requeridos" }, { status: 400 });

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("Cost")
    .insert({
      id: crypto.randomUUID(),
      name,
      amount: Number(amount),
      currency: currency ?? "USD",
      type: type ?? "Suscripción",
      category: category ?? "Herramienta",
      frequency: frequency ?? "Mensual",
      notes: notes ?? null,
      paidAt: paidAt ? new Date(paidAt).toISOString() : null,
      createdAt: now,
      updatedAt: now,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
