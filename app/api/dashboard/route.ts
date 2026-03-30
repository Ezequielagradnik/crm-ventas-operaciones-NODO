export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000);

  const [
    { count: newLeads },
    { data: deals },
    { data: activeClients },
    { count: pendingTasks },
    { data: activities },
    { data: todayTasks },
  ] = await Promise.all([
    supabase.from("Lead").select("*", { count: "exact", head: true }).gte("createdAt", weekAgo.toISOString()),
    supabase.from("Deal").select("value, stage").neq("stage", "Cerrado perdido"),
    supabase.from("Client").select("mrr").eq("status", "Activo"),
    supabase.from("Task").select("*", { count: "exact", head: true }).neq("status", "Completada"),
    supabase
      .from("Activity")
      .select(`*, user:User!Activity_userId_fkey(id, name), lead:Lead!Activity_leadId_fkey(id, name), deal:Deal!Activity_dealId_fkey(id, company)`)
      .order("createdAt", { ascending: false })
      .limit(10),
    supabase
      .from("Task")
      .select(`*, owner:User!Task_ownerId_fkey(id, name)`)
      .neq("status", "Completada")
      .gte("dueDate", todayStart.toISOString())
      .lt("dueDate", todayEnd.toISOString())
      .order("dueDate")
      .limit(10),
  ]);

  const pipelineValue = (deals ?? []).reduce((s, d) => s + Number(d.value), 0);
  const mrr = (activeClients ?? []).reduce((s, c) => s + Number(c.mrr), 0);
  const stageBreakdown = (deals ?? []).reduce<Record<string, number>>((acc, d) => {
    acc[d.stage] = (acc[d.stage] ?? 0) + Number(d.value);
    return acc;
  }, {});

  return NextResponse.json({
    kpis: {
      newLeads: newLeads ?? 0,
      pipelineValue,
      activeClients: (activeClients ?? []).length,
      mrr,
      pendingTasks: pendingTasks ?? 0,
    },
    stageBreakdown,
    recentActivity: activities ?? [],
    todayTasks: todayTasks ?? [],
  });
}
