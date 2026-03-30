import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const TASK_SELECT = `*, owner:User!Task_ownerId_fkey(id, name), lead:Lead!Task_leadId_fkey(id, name), deal:Deal!Task_dealId_fkey(id, company)`;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const status = searchParams.get("status");
  const today = searchParams.get("today");

  let query = supabase.from("Task").select(TASK_SELECT);

  if (owner) query = query.eq("ownerId", owner);
  if (status) query = query.eq("status", status);
  if (today === "1") {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start.getTime() + 86400000);
    query = query.gte("dueDate", start.toISOString()).lt("dueDate", end.toISOString());
  }

  query = query.order("dueDate", { ascending: true, nullsFirst: false }).order("createdAt", { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, priority, status, dueDate, ownerId, leadId, dealId } = body;
  if (!title) return NextResponse.json({ error: "Título requerido" }, { status: 400 });

  let resolvedOwnerId = ownerId;
  if (!resolvedOwnerId) {
    const { data: users } = await supabase.from("User").select("id").limit(1);
    resolvedOwnerId = users?.[0]?.id;
  }

  const { data, error } = await supabase
    .from("Task")
    .insert({
      id: crypto.randomUUID(),
      title,
      description: description ?? null,
      priority: priority ?? "Media",
      status: status ?? "Pendiente",
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      ownerId: resolvedOwnerId,
      leadId: leadId ?? null,
      dealId: dealId ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select(TASK_SELECT)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
