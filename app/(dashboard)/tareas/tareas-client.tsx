"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, CheckSquare, Square, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, TASK_PRIORITIES, TASK_STATUSES } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority: string;
  status: string;
  dueDate?: string | null;
  ownerId: string;
  owner: { id: string; name: string };
  lead?: { id: string; name: string } | null;
  deal?: { id: string; company: string } | null;
  createdAt: string;
}

interface User { id: string; name: string; }

const priorityVariant: Record<string, "danger" | "warning" | "secondary"> = {
  Alta: "danger", Media: "warning", Baja: "secondary",
};

function TaskForm({ task, users, onSave, onClose }: { task?: Partial<Task>; users: User[]; onSave: (d: Partial<Task>) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState({
    title: task?.title ?? "",
    description: task?.description ?? "",
    priority: task?.priority ?? "Media",
    status: task?.status ?? "Pendiente",
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "",
    ownerId: task?.ownerId ?? (users[0]?.id ?? ""),
  });
  const [loading, setLoading] = useState(false);
  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try { await onSave({ ...form, dueDate: form.dueDate || null }); }
    finally { setLoading(false); }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="tf-title">Tarea *</Label>
        <Input id="tf-title" value={form.title} onChange={e => set("title", e.target.value)} required autoComplete="off" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tf-desc">Descripción</Label>
        <Textarea id="tf-desc" value={form.description} onChange={e => set("description", e.target.value)} rows={2} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="tf-priority">Prioridad</Label>
          <Select value={form.priority} onValueChange={v => set("priority", v)}>
            <SelectTrigger id="tf-priority"><SelectValue /></SelectTrigger>
            <SelectContent>{TASK_PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tf-status">Estado</Label>
          <Select value={form.status} onValueChange={v => set("status", v)}>
            <SelectTrigger id="tf-status"><SelectValue /></SelectTrigger>
            <SelectContent>{TASK_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tf-due">Fecha límite</Label>
          <Input id="tf-due" type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tf-owner">Owner</Label>
          <Select value={form.ownerId} onValueChange={v => set("ownerId", v)}>
            <SelectTrigger id="tf-owner"><SelectValue /></SelectTrigger>
            <SelectContent>{users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? "Guardando…" : "Guardar"}</Button>
      </DialogFooter>
    </form>
  );
}

export function TareasClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>();
  const [filterOwner, setFilterOwner] = useState("all");
  const [filterStatus, setFilterStatus] = useState("active");

  const fetchTasks = useCallback(() => {
    const params = new URLSearchParams();
    if (filterOwner !== "all") params.set("owner", filterOwner);
    fetch(`/api/tasks?${params}`).then(r => r.json()).then(setTasks).catch(console.error);
  }, [filterOwner]);

  useEffect(() => {
    fetchTasks();
    fetch("/api/users").then(r => r.json()).then(setUsers).catch(() => setUsers([]));
  }, [fetchTasks]);

  async function toggleStatus(task: Task) {
    const newStatus = task.status === "Completada" ? "Pendiente" : "Completada";
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchTasks();
  }

  async function handleSave(data: Partial<Task>) {
    if (editing) {
      await fetch(`/api/tasks/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    } else {
      await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    }
    setModalOpen(false);
    setEditing(undefined);
    fetchTasks();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta tarea?")) return;
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    fetchTasks();
  }

  const now = new Date();
  const filtered = tasks.filter(t => {
    if (filterStatus === "active") return t.status !== "Completada";
    if (filterStatus === "done") return t.status === "Completada";
    if (filterStatus === "overdue") return t.status !== "Completada" && t.dueDate && new Date(t.dueDate) < now;
    return true;
  });

  const pending = tasks.filter(t => t.status !== "Completada").length;
  const overdue = tasks.filter(t => t.status !== "Completada" && t.dueDate && new Date(t.dueDate) < now).length;

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-0.5">
          {[
            { v: "active", l: `Pendientes (${pending})` },
            { v: "done", l: "Completadas" },
            { v: "overdue", l: `Vencidas${overdue > 0 ? ` (${overdue})` : ""}` },
            { v: "all", l: "Todas" },
          ].map(({ v, l }) => (
            <button key={v} onClick={() => setFilterStatus(v)}
              className={cn("rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                filterStatus === v ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"
              )}>
              {l}
            </button>
          ))}
        </div>
        <Select value={filterOwner} onValueChange={setFilterOwner}>
          <SelectTrigger className="w-28 h-8" aria-label="Filtrar por owner">
            <SelectValue placeholder="Owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" className="ml-auto" onClick={() => { setEditing(undefined); setModalOpen(true); }}>
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Nueva tarea
        </Button>
      </div>

      <div className="space-y-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface py-16">
            <CheckSquare className="h-10 w-10 text-text-muted opacity-30" aria-hidden="true" />
            <p className="text-sm text-text-muted">Sin tareas</p>
          </div>
        ) : filtered.map(task => {
          const isOverdue = task.status !== "Completada" && task.dueDate && new Date(task.dueDate) < now;
          return (
            <div
              key={task.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border border-border bg-surface p-3 hover:border-primary/30 transition-colors group",
                task.status === "Completada" && "opacity-50"
              )}
            >
              <button
                onClick={() => toggleStatus(task)}
                aria-label={task.status === "Completada" ? "Marcar como pendiente" : "Marcar como completada"}
                className="mt-0.5 shrink-0 text-text-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                {task.status === "Completada"
                  ? <CheckSquare className="h-4 w-4 text-success" aria-hidden="true" />
                  : <Square className="h-4 w-4" aria-hidden="true" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium text-text-primary truncate", task.status === "Completada" && "line-through text-text-muted")}>
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-xs text-text-muted truncate mt-0.5">{task.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <Badge variant={priorityVariant[task.priority] ?? "secondary"}>{task.priority}</Badge>
                  {task.dueDate && (
                    <span className={cn("flex items-center gap-1 text-xs", isOverdue ? "text-danger" : "text-text-muted")}>
                      {isOverdue && <AlertCircle className="h-3 w-3" aria-hidden="true" />}
                      {formatDate(task.dueDate)}
                    </span>
                  )}
                  <span className="text-xs text-text-muted">{task.owner.name}</span>
                  {task.lead && <span className="text-xs text-text-muted">· {task.lead.name}</span>}
                  {task.deal && <span className="text-xs text-text-muted">· {task.deal.company}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditing(task); setModalOpen(true); }} aria-label={`Editar ${task.title}`}
                  className="h-7 w-7 flex items-center justify-center rounded-md text-text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <span className="text-xs" aria-hidden="true">✎</span>
                </button>
                <button onClick={() => handleDelete(task.id)} aria-label={`Eliminar ${task.title}`}
                  className="h-7 w-7 flex items-center justify-center rounded-md text-text-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={modalOpen} onOpenChange={o => { if (!o) { setModalOpen(false); setEditing(undefined); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Editar tarea" : "Nueva tarea"}</DialogTitle></DialogHeader>
          <TaskForm task={editing} users={users} onSave={handleSave} onClose={() => { setModalOpen(false); setEditing(undefined); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
