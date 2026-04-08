import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const SELECT = `*, createdBy:User!ContentPost_createdBy_fkey(id, name)`;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform");
  const status = searchParams.get("status");

  let query = supabase.from("ContentPost").select(SELECT);
  if (platform) query = query.eq("platform", platform);
  if (status) query = query.eq("status", status);
  query = query.order("createdAt", { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, idea, platform, status, canvaUrl, hook, cta, format, scheduledAt, createdBy } = body;
  if (!title || !idea) return NextResponse.json({ error: "Título e idea requeridos" }, { status: 400 });

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("ContentPost")
    .insert({
      id: crypto.randomUUID(),
      title,
      idea,
      platform: platform ?? "LinkedIn",
      status: status ?? "Idea",
      canvaUrl: canvaUrl ?? null,
      hook: hook ?? null,
      cta: cta ?? null,
      format: format ?? "Post",
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      publishedAt: null,
      createdBy: createdBy ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .select(SELECT)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
