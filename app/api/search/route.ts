import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const [{ data: leads }, { data: deals }, { data: clients }, { data: tasks }] = await Promise.all([
    supabase.from("Lead").select("id, name, company").or(`name.ilike.%${q}%,company.ilike.%${q}%,email.ilike.%${q}%`).limit(5),
    supabase.from("Deal").select("id, company, stage").ilike("company", `%${q}%`).limit(5),
    supabase.from("Client").select("id, company, contact").or(`company.ilike.%${q}%,contact.ilike.%${q}%`).limit(5),
    supabase.from("Task").select("id, title, status").ilike("title", `%${q}%`).limit(5),
  ]);

  return NextResponse.json({
    results: [
      ...(leads ?? []).map((l) => ({ id: l.id, type: "lead" as const, title: l.name, subtitle: l.company ?? undefined, href: `/leads/${l.id}` })),
      ...(deals ?? []).map((d) => ({ id: d.id, type: "deal" as const, title: d.company, subtitle: d.stage, href: `/deals` })),
      ...(clients ?? []).map((c) => ({ id: c.id, type: "client" as const, title: c.company, subtitle: c.contact, href: `/clientes` })),
      ...(tasks ?? []).map((t) => ({ id: t.id, type: "task" as const, title: t.title, subtitle: t.status, href: `/tareas` })),
    ],
  });
}
