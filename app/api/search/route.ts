import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (!q || q.length < 2) return NextResponse.json({ results: [] });
  const p = `%${q}%`;
  const [leads, deals, clients, tasks] = await Promise.all([
    db.query(`SELECT id, name, company FROM "Lead" WHERE name ILIKE $1 OR company ILIKE $1 OR email ILIKE $1 LIMIT 5`, [p]),
    db.query(`SELECT id, company, stage FROM "Deal" WHERE company ILIKE $1 LIMIT 5`, [p]),
    db.query(`SELECT id, company, contact FROM "Client" WHERE company ILIKE $1 OR contact ILIKE $1 LIMIT 5`, [p]),
    db.query(`SELECT id, title, status FROM "Task" WHERE title ILIKE $1 LIMIT 5`, [p]),
  ]);
  return NextResponse.json({ results: [
    ...leads.rows.map((l) => ({ id: l.id, type: "lead" as const, title: l.name, subtitle: l.company ?? undefined, href: `/leads/${l.id}` })),
    ...deals.rows.map((d) => ({ id: d.id, type: "deal" as const, title: d.company, subtitle: d.stage, href: `/deals` })),
    ...clients.rows.map((c) => ({ id: c.id, type: "client" as const, title: c.company, subtitle: c.contact, href: `/clientes` })),
    ...tasks.rows.map((t) => ({ id: t.id, type: "task" as const, title: t.title, subtitle: t.status, href: `/tareas` })),
  ]});
}
