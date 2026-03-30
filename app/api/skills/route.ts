import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const SKILL_SELECT = `*, addedBy:User!ClaudeSkill_addedBy_fkey(id, name)`;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  let query = supabase.from("ClaudeSkill").select(SKILL_SELECT);
  if (category) query = query.eq("category", category);
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,tags.ilike.%${search}%`);
  query = query.order("createdAt", { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, url, category, tags, addedBy } = body;
  if (!title || !url) return NextResponse.json({ error: "Título y URL requeridos" }, { status: 400 });

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("ClaudeSkill")
    .insert({
      id: crypto.randomUUID(),
      title,
      description: description ?? null,
      url,
      category: category ?? "General",
      tags: tags ?? null,
      addedBy: addedBy ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .select(SKILL_SELECT)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
