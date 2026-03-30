export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000);

  const [leadsRes, dealsRes, clientsRes, tasksRes, activitiesRes, todayTasksRes] = await Promise.all([
    db.query(`SELECT COUNT(*)::int FROM "Lead" WHERE "createdAt" >= $1`, [weekAgo]),
    db.query(`SELECT value, stage FROM "Deal" WHERE stage != 'Cerrado perdido'`),
    db.query(`SELECT mrr FROM "Client" WHERE status = 'Activo'`),
    db.query(`SELECT COUNT(*)::int FROM "Task" WHERE status != 'Completada'`),
    db.query(`
      SELECT a.*,
        json_build_object('id', u.id, 'name', u.name) AS "user",
        CASE WHEN a."leadId" IS NOT NULL THEN json_build_object('id', l.id, 'name', l.name) ELSE NULL END AS lead,
        CASE WHEN a."dealId" IS NOT NULL THEN json_build_object('id', d.id, 'company', d.company) ELSE NULL END AS deal
      FROM "Activity" a
      LEFT JOIN "User" u ON a."userId" = u.id
      LEFT JOIN "Lead" l ON a."leadId" = l.id
      LEFT JOIN "Deal" d ON a."dealId" = d.id
      ORDER BY a."createdAt" DESC LIMIT 10
    `),
    db.query(`
      SELECT t.*, json_build_object('id', u.id, 'name', u.name) AS owner
      FROM "Task" t
      LEFT JOIN "User" u ON t."ownerId" = u.id
      WHERE t.status != 'Completada' AND t."dueDate" >= $1 AND t."dueDate" < $2
      ORDER BY t."dueDate" ASC LIMIT 10
    `, [todayStart, todayEnd]),
  ]);

  const deals = dealsRes.rows;
  const activeClients = clientsRes.rows;
  const pipelineValue = deals.reduce((s: number, d: { value: number }) => s + Number(d.value), 0);
  const mrr = activeClients.reduce((s: number, c: { mrr: number }) => s + Number(c.mrr), 0);
  const stageBreakdown = deals.reduce<Record<string, number>>((acc: Record<string, number>, d: { value: number; stage: string }) => {
    acc[d.stage] = (acc[d.stage] ?? 0) + Number(d.value);
    return acc;
  }, {});

  return NextResponse.json({
    kpis: { newLeads: leadsRes.rows[0].count, pipelineValue, activeClients: activeClients.length, mrr, pendingTasks: tasksRes.rows[0].count },
    stageBreakdown,
    recentActivity: activitiesRes.rows,
    todayTasks: todayTasksRes.rows,
  });
}
