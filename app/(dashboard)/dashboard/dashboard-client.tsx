"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, Kanban, UserCheck, CheckSquare, TrendingUp,
  DollarSign, Clock, AlertCircle, Plus
} from "lucide-react";
import { formatCurrency, formatRelativeTime, DEAL_STAGES } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuickAddModal } from "@/components/modals/quick-add-modal";

interface DashboardData {
  kpis: {
    newLeads: number;
    pipelineValue: number;
    activeClients: number;
    mrr: number;
    pendingTasks: number;
  };
  stageBreakdown: Record<string, number>;
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    createdAt: string;
    user: { name: string };
    lead?: { id: string; name: string } | null;
    deal?: { id: string; company: string } | null;
  }>;
  todayTasks: Array<{
    id: string;
    title: string;
    priority: string;
    status: string;
    owner: { name: string };
  }>;
}

function KpiCard({
  label, value, icon: Icon, sub
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</span>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
        </div>
      </div>
      <p className="text-2xl font-bold tabular-nums text-text-primary">{value}</p>
      {sub && <p className="mt-1 text-xs text-text-muted">{sub}</p>}
    </div>
  );
}

const priorityVariant: Record<string, "danger" | "warning" | "secondary"> = {
  Alta: "danger",
  Media: "warning",
  Baja: "secondary",
};

export function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-sm text-text-muted">Cargando…</div>
      </div>
    );
  }

  const maxStageValue = Math.max(...Object.values(data.stageBreakdown), 1);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiCard
          label="Leads nuevos"
          value={String(data.kpis.newLeads)}
          icon={Users}
          sub="Esta semana"
        />
        <KpiCard
          label="Pipeline"
          value={formatCurrency(data.kpis.pipelineValue)}
          icon={TrendingUp}
          sub="Valor total activo"
        />
        <KpiCard
          label="Clientes activos"
          value={String(data.kpis.activeClients)}
          icon={UserCheck}
        />
        <KpiCard
          label="MRR"
          value={formatCurrency(data.kpis.mrr)}
          icon={DollarSign}
          sub="Mensual recurrente"
        />
        <KpiCard
          label="Tareas pendientes"
          value={String(data.kpis.pendingTasks)}
          icon={CheckSquare}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pipeline mini */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-primary">Pipeline por etapa</h2>
            <Link href="/deals" className="text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
              Ver todo →
            </Link>
          </div>
          <div className="space-y-2">
            {DEAL_STAGES.filter(s => s !== "Cerrado perdido").map((stage) => {
              const val = data.stageBreakdown[stage] ?? 0;
              const pct = Math.round((val / maxStageValue) * 100);
              return (
                <div key={stage} className="flex items-center gap-3">
                  <span className="w-36 shrink-0 text-xs text-text-secondary truncate">{stage}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${pct}%` }}
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={stage}
                    />
                  </div>
                  <span className="w-20 text-right text-xs tabular-nums text-text-muted">
                    {val > 0 ? formatCurrency(val) : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity feed */}
        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Actividad reciente</h2>
          {data.recentActivity.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-6">Sin actividad aún</p>
          ) : (
            <ol className="space-y-3">
              {data.recentActivity.map((act) => (
                <li key={act.id} className="flex gap-2.5">
                  <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60 mt-1.5" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-xs text-text-primary leading-snug truncate">{act.message}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      {act.user.name} · {formatRelativeTime(act.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Today's tasks */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Tareas de hoy</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuickAddOpen(true)}
              aria-label="Agregar tarea rápida"
              className="flex items-center gap-1.5 text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              <Plus className="h-3 w-3" aria-hidden="true" />
              Agregar
            </button>
            <Link href="/tareas" className="text-xs text-text-muted hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
              Ver todo →
            </Link>
          </div>
        </div>
        {data.todayTasks.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <CheckSquare className="h-8 w-8 text-text-muted opacity-40" aria-hidden="true" />
            <p className="text-sm text-text-muted">Sin tareas para hoy</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {data.todayTasks.map((task) => (
              <li key={task.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-border/30 transition-colors">
                <div className="h-4 w-4 shrink-0 rounded border border-border" aria-hidden="true" />
                <span className="flex-1 text-sm text-text-primary truncate min-w-0">{task.title}</span>
                <Badge variant={priorityVariant[task.priority] ?? "secondary"}>
                  {task.priority}
                </Badge>
                <span className="text-xs text-text-muted shrink-0">{task.owner.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <QuickAddModal isOpen={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </div>
  );
}
