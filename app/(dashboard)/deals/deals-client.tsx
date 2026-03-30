"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { Plus, Trash2, DollarSign, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, getDaysSince, getInitials, DEAL_STAGES, DEAL_SERVICES } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Deal {
  id: string;
  company: string;
  value: number;
  service: string;
  stage: string;
  ownerId: string;
  owner: { id: string; name: string };
  lead?: { id: string; name: string } | null;
  notes?: string | null;
  stageMovedAt: string;
  createdAt: string;
}

interface User { id: string; name: string; }

const stageColors: Record<string, string> = {
  "Nuevo contacto": "border-t-primary",
  "Discovery call agendada": "border-t-info",
  "Propuesta enviada": "border-t-warning",
  "Negociación": "border-t-orange-400",
  "Cerrado ganado": "border-t-success",
  "Cerrado perdido": "border-t-danger",
};

const stageDot: Record<string, string> = {
  "Nuevo contacto": "bg-primary",
  "Discovery call agendada": "bg-info",
  "Propuesta enviada": "bg-warning",
  "Negociación": "bg-orange-400",
  "Cerrado ganado": "bg-success",
  "Cerrado perdido": "bg-danger",
};

function DealCard({ deal, isDragging = false }: { deal: Deal; isDragging?: boolean }) {
  const days = getDaysSince(deal.stageMovedAt);
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-background p-3 border-t-2 select-none",
        stageColors[deal.stage] ?? "border-t-border",
        isDragging ? "opacity-50 rotate-1 shadow-lg" : "hover:border-primary/40 hover:shadow-glow-sm transition-all"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-text-primary leading-snug truncate min-w-0">{deal.company}</p>
        {deal.value > 0 && (
          <span className="shrink-0 text-xs font-semibold tabular-nums text-success">{formatCurrency(deal.value)}</span>
        )}
      </div>
      <p className="text-xs text-text-muted mb-2.5 truncate">{deal.service}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[9px]">{getInitials(deal.owner.name)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-text-muted">{deal.owner.name.split(" ")[0]}</span>
        </div>
        <div className="flex items-center gap-1 text-text-muted">
          <Clock className="h-3 w-3" aria-hidden="true" />
          <span className="text-xs tabular-nums">{days}d</span>
        </div>
      </div>
    </div>
  );
}

function DraggableDealCard({ deal, onDelete }: { deal: Deal; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: deal.id });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className="relative group cursor-grab active:cursor-grabbing">
      <DealCard deal={deal} isDragging={isDragging} />
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onDelete(deal.id); }}
        aria-label={`Eliminar deal ${deal.company}`}
        className="absolute right-2 top-2 hidden group-hover:flex h-5 w-5 items-center justify-center rounded text-text-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Trash2 className="h-3 w-3" aria-hidden="true" />
      </button>
    </div>
  );
}

function Column({ stage, deals, onDelete }: { stage: string; deals: Deal[]; onDelete: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const totalValue = deals.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col min-w-60 w-60 shrink-0">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn("h-2 w-2 rounded-full shrink-0", stageDot[stage] ?? "bg-border")} aria-hidden="true" />
          <h3 className="text-xs font-semibold text-text-primary truncate">{stage}</h3>
          <span className="rounded-full bg-border px-1.5 py-0.5 text-[10px] font-medium text-text-muted tabular-nums">
            {deals.length}
          </span>
        </div>
        {totalValue > 0 && (
          <span className="text-[10px] tabular-nums text-text-muted shrink-0">{formatCurrency(totalValue)}</span>
        )}
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-col gap-2 rounded-xl border border-border bg-surface p-2 min-h-24 flex-1 transition-colors",
          isOver && "border-primary/50 bg-primary/5"
        )}
      >
        {deals.map((deal) => (
          <DraggableDealCard key={deal.id} deal={deal} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

function DealForm({ users, onSave, onClose }: { users: User[]; onSave: (d: Partial<Deal>) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState({
    company: "", value: "", service: "Consultoría", stage: "Nuevo contacto",
    ownerId: users[0]?.id ?? "", notes: "",
  });
  const [loading, setLoading] = useState(false);
  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try { await onSave({ ...form, value: parseFloat(form.value) || 0 }); }
    finally { setLoading(false); }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="df-company">Empresa *</Label>
          <Input id="df-company" value={form.company} onChange={e => set("company", e.target.value)} required autoComplete="organization" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="df-value">Valor (USD)</Label>
          <Input id="df-value" type="number" min="0" step="100" value={form.value} onChange={e => set("value", e.target.value)} placeholder="0" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="df-service">Servicio</Label>
          <Select value={form.service} onValueChange={v => set("service", v)}>
            <SelectTrigger id="df-service"><SelectValue /></SelectTrigger>
            <SelectContent>{DEAL_SERVICES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="df-stage">Etapa</Label>
          <Select value={form.stage} onValueChange={v => set("stage", v)}>
            <SelectTrigger id="df-stage"><SelectValue /></SelectTrigger>
            <SelectContent>{DEAL_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="df-owner">Owner</Label>
          <Select value={form.ownerId} onValueChange={v => set("ownerId", v)}>
            <SelectTrigger id="df-owner"><SelectValue /></SelectTrigger>
            <SelectContent>{users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="df-notes">Notas</Label>
          <Textarea id="df-notes" value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? "Guardando…" : "Crear deal"}</Button>
      </DialogFooter>
    </form>
  );
}

export function DealsClient() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const fetchDeals = useCallback(() => {
    fetch("/api/deals").then(r => r.json()).then(setDeals).catch(console.error);
  }, []);

  useEffect(() => {
    fetchDeals();
    fetch("/api/users").then(r => r.json()).then(setUsers).catch(() => setUsers([]));
  }, [fetchDeals]);

  function handleDragStart(e: DragStartEvent) {
    const deal = deals.find(d => d.id === e.active.id);
    setActiveDeal(deal ?? null);
  }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveDeal(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const dealId = active.id as string;
    const newStage = over.id as string;
    const deal = deals.find(d => d.id === dealId);
    if (!deal || deal.stage === newStage) return;

    // Optimistic update
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage: newStage } : d));

    try {
      await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
    } catch {
      fetchDeals();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este deal?")) return;
    await fetch(`/api/deals/${id}`, { method: "DELETE" });
    fetchDeals();
  }

  async function handleSave(data: Partial<Deal>) {
    await fetch("/api/deals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setModalOpen(false);
    fetchDeals();
  }

  const dealsByStage = DEAL_STAGES.reduce<Record<string, Deal[]>>((acc, stage) => {
    acc[stage] = deals.filter(d => d.stage === stage);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
          <DollarSign className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <span className="text-xs text-text-muted">Pipeline total:</span>
          <span className="text-sm font-semibold tabular-nums text-text-primary">
            {formatCurrency(deals.filter(d => !["Cerrado perdido"].includes(d.stage)).reduce((s, d) => s + d.value, 0))}
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
          <span className="text-xs text-text-muted">Ganado:</span>
          <span className="text-sm font-semibold tabular-nums text-success">
            {formatCurrency(dealsByStage["Cerrado ganado"]?.reduce((s, d) => s + d.value, 0) ?? 0)}
          </span>
        </div>
        <div className="ml-auto">
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Nuevo deal
          </Button>
        </div>
      </div>

      {/* Kanban */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {DEAL_STAGES.map(stage => (
              <Column key={stage} stage={stage} deals={dealsByStage[stage] ?? []} onDelete={handleDelete} />
            ))}
          </div>
        </div>
        <DragOverlay>
          {activeDeal && <DealCard deal={activeDeal} />}
        </DragOverlay>
      </DndContext>

      <Dialog open={modalOpen} onOpenChange={o => !o && setModalOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo deal</DialogTitle>
          </DialogHeader>
          <DealForm users={users} onSave={handleSave} onClose={() => setModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
