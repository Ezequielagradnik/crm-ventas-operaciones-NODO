"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users, Kanban, UserCheck, CheckSquare, TrendingUp,
  DollarSign, Plus, Check, Pencil, X
} from "lucide-react";
import { formatCurrency, formatRelativeTime, DEAL_STAGES } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
  }>;
  todayTasks: Array<{
    id: string;
    title: string;
    priority: string;
    status: string;
    owner: { name: string };
  }>;
}

interface WeekTask {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  owner: { id: string; name: string };
}

function KpiCard({ label, value, icon: Icon, sub }: {
  label: string; value: string; icon: React.ElementType; sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</span>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
      </div>
      <p className="text-2xl font-bold tabular-nums text-text-primary">{value}</p>
      {sub && <p className="mt-1 text-xs text-text-muted">{sub}</p>}
    </div>
  );
}

const priorityVariant: Record<string, "danger" | "warning" | "secondary"> = {
  Alta: "danger", Media: "warning", Baja: "secondary",
};

function WeekTaskItem({ task, onToggle, onEdit }: {
  task: WeekTask;
  onToggle: (id: string, done: boolean) => void;
  onEdit: (id: string, title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const done = task.status === "Completada";

  function save() {
    if (draft.trim() && draft !== task.title) onEdit(task.id, draft.trim());
    setEditing(false);
  }

  return (
    <li className="flex items-start gap-3 rounded-lg p-2.5 hover:bg-border/20 transition-colors group">
      <button
        onClick={() => onToggle(task.id, !done)}
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
          done ? "bg-primary border-primary" : "border-border hover:border-primary"
        }`}
        aria-label={done ? "Marcar pendiente" : "Marcar completada"}
      >
        {done && <Check className="h-2.5 w-2.5 text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              className="flex-1 bg-background border border-primary rounded px-2 py-0.5 text-sm text-text-primary focus:outline-none"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") { setDraft(task.title); setEditing(false); } }}
              autoFocus
            />
            <button onClick={save} className="text-primary hover:text-primary/80"><Check className="h-3.5 w-3.5" /></button>
            <button onClick={() => { setDraft(task.title); setEditing(false); }} className="text-text-muted hover:text-text-secondary"><X className="h-3.5 w-3.5" /></button>
          </div>
        ) : (
          <p className={`text-sm leading-snug ${done ? "line-through text-text-muted" : "text-text-primary"}`}>
            {task.title}
          </p>
        )}
        {task.description && !editing && (
          <p className="text-[11px] text-text-muted mt-0.5 leading-snug">{task.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Badge variant={priorityVariant[task.priority] ?? "secondary"}>{task.priority}</Badge>
        <span className="text-[11px] text-text-muted hidden sm:block">{task.owner.name.split(" ")[0]}</span>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-text-secondary"
            aria-label="Editar tarea"
          >
            <Pencil className="h-3 w-3" />
          </button>
        )}
      </div>
    </li>
  );
}

export function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [weekTasks, setWeekTasks] = useState<WeekTask[]>([]);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const loadData = useCallback(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData).catch(console.error);

    const now = new Date();
    const weekEnd = new Date(now.getTime() + 7 * 86400000).toISOString();
    fetch("/api/tasks?sort=week")
      .then((r) => r.json())
      .then((tasks: WeekTask[]) => {
        // show tasks due within next 7 days or no due date
        const filtered = tasks.filter((t) => {
          if (!t.dueDate) return true;
          return new Date(t.dueDate) <= new Date(weekEnd);
        });
        setWeekTasks(filtered);
      })
      .catch(console.error);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleToggle(id: string, done: boolean) {
    const status = done ? "Completada" : "Pendiente";
    await fetch(`/api/tasks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setWeekTasks((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
    // refresh KPIs
    fetch("/api/dashboard").then((r) => r.json()).then(setData).catch(console.error);
  }

  async function handleEdit(id: string, title: string) {
    await fetch(`/api/tasks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) });
    setWeekTasks((prev) => prev.map((t) => t.id === id ? { ...t, title } : t));
  }

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-sm text-text-muted">Cargando…</div>
      </div>
    );
  }

  const maxStageValue = Math.max(...Object.values(data.stageBreakdown), 1);
  const pendingWeek = weekTasks.filter((t) => t.status !== "Completada").length;
  const doneWeek = weekTasks.filter((t) => t.status === "Completada").length;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiCard label="Leads nuevos" value={String(data.kpis.newLeads)} icon={Users} sub="Esta semana" />
        <KpiCard label="Pipeline" value={formatCurrency(data.kpis.pipelineValue)} icon={TrendingUp} sub="Valor activo" />
        <KpiCard label="Clientes activos" value={String(data.kpis.activeClients)} icon={UserCheck} />
        <KpiCard label="MRR" value={formatCurrency(data.kpis.mrr)} icon={DollarSign} sub="Mensual recurrente" />
        <KpiCard label="Tareas pendientes" value={String(data.kpis.pendingTasks)} icon={CheckSquare} />
      </div>

      {/* Tareas de la semana */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Tareas de esta semana</h2>
            <p className="text-xs text-text-muted mt-0.5">
              {doneWeek}/{weekTasks.length} completadas
            </p>
          </div>
          <div className="flex items-center gap-3">
            {weekTasks.length > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-24 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${weekTasks.length ? (doneWeek / weekTasks.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs text-text-muted tabular-nums">
                  {weekTasks.length ? Math.round((doneWeek / weekTasks.length) * 100) : 0}%
                </span>
              </div>
            )}
            <button
              onClick={() => setQuickAddOpen(true)}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Plus className="h-3 w-3" /> Agregar
            </button>
            <Link href="/tareas" className="text-xs text-text-muted hover:text-text-secondary">Ver todo →</Link>
          </div>
        </div>

        {weekTasks.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <CheckSquare className="h-8 w-8 text-text-muted opacity-40" />
            <p className="text-sm text-text-muted">Sin tareas esta semana</p>
            <button onClick={() => setQuickAddOpen(true)} className="text-xs text-primary hover:underline">Agregar tarea</button>
          </div>
        ) : (
          <ul className="space-y-1">
            {weekTasks
              .sort((a, b) => {
                if (a.status === "Completada" && b.status !== "Completada") return 1;
                if (a.status !== "Completada" && b.status === "Completada") return -1;
                const pa = { Alta: 0, Media: 1, Baja: 2 }[a.priority] ?? 3;
                const pb = { Alta: 0, Media: 1, Baja: 2 }[b.priority] ?? 3;
                return pa - pb;
              })
              .map((task) => (
                <WeekTaskItem key={task.id} task={task} onToggle={handleToggle} onEdit={handleEdit} />
              ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pipeline mini */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-primary">Pipeline por etapa</h2>
            <Link href="/deals" className="text-xs text-primary hover:underline">Ver todo →</Link>
          </div>
          <div className="space-y-2">
            {DEAL_STAGES.filter((s) => s !== "Cerrado perdido").map((stage) => {
              const val = data.stageBreakdown[stage] ?? 0;
              const pct = Math.round((val / maxStageValue) * 100);
              return (
                <div key={stage} className="flex items-center gap-3">
                  <span className="w-36 shrink-0 text-xs text-text-secondary truncate">{stage}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
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
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                  <div className="min-w-0">
                    <p className="text-xs text-text-primary leading-snug truncate">{act.message}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      {act.user?.name} · {formatRelativeTime(act.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <QuickAddModal isOpen={quickAddOpen} onClose={() => { setQuickAddOpen(false); loadData(); }} />
    </div>
  );
}
