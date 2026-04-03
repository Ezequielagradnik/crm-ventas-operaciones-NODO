"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Check, TrendingDown, DollarSign, RefreshCw, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TYPES = ["Suscripción", "Pago único", "Variable"];
const CATEGORIES = ["Herramienta", "Infraestructura", "Marketing", "Legal", "Diseño", "Otro"];
const FREQUENCIES = ["Mensual", "Anual", "Única vez", "Por uso"];
const CURRENCIES = ["USD", "ARS"];

interface Cost {
  id: string;
  name: string;
  amount: number;
  currency: string;
  type: string;
  category: string;
  frequency: string;
  notes: string | null;
  paidAt: string | null;
  createdAt: string;
}

const TYPE_VARIANT: Record<string, "default" | "warning" | "info"> = {
  "Suscripción": "default",
  "Pago único": "warning",
  "Variable": "info",
};

const CATEGORY_VARIANT: Record<string, "default" | "success" | "warning" | "danger" | "secondary" | "info"> = {
  Herramienta: "default",
  Infraestructura: "info",
  Marketing: "warning",
  Legal: "danger",
  Diseño: "success",
  Otro: "secondary",
};

function fmtAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
}

// Normalize to monthly USD (ARS approx 1300)
function toMonthlyUSD(cost: Cost): number {
  let monthly = cost.amount;
  if (cost.frequency === "Anual") monthly = cost.amount / 12;
  if (cost.frequency === "Única vez") monthly = 0;
  if (cost.currency === "ARS") monthly = monthly / 1300;
  return monthly;
}

function CostForm({ initial, onSave, onCancel }: {
  initial?: Partial<Cost>;
  onSave: (d: Partial<Cost>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    amount: String(initial?.amount ?? ""),
    currency: initial?.currency ?? "USD",
    type: initial?.type ?? "Suscripción",
    category: initial?.category ?? "Herramienta",
    frequency: initial?.frequency ?? "Mensual",
    notes: initial?.notes ?? "",
    paidAt: initial?.paidAt ? new Date(initial.paidAt).toISOString().slice(0, 10) : "",
  });

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.amount) return;
    onSave({
      name: form.name,
      amount: parseFloat(form.amount),
      currency: form.currency,
      type: form.type,
      category: form.category,
      frequency: form.frequency,
      notes: form.notes || null,
      paidAt: form.paidAt || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1 col-span-2">
          <label className="text-xs font-medium text-text-muted">Nombre *</label>
          <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Claude API, Vercel Pro, etc." required autoFocus />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-muted">Monto *</label>
          <input type="number" step="0.01" min="0" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="20" required />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-muted">Moneda</label>
          <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            value={form.currency} onChange={(e) => set("currency", e.target.value)}>
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-muted">Tipo</label>
          <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            value={form.type} onChange={(e) => set("type", e.target.value)}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-muted">Frecuencia</label>
          <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            value={form.frequency} onChange={(e) => set("frequency", e.target.value)}>
            {FREQUENCIES.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-muted">Categoría</label>
          <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            value={form.category} onChange={(e) => set("category", e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-muted">Último pago</label>
          <input type="date" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            value={form.paidAt} onChange={(e) => set("paidAt", e.target.value)} />
        </div>
        <div className="space-y-1 col-span-2">
          <label className="text-xs font-medium text-text-muted">Notas</label>
          <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Plan, cuenta, detalles..." />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onCancel} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors">
          <X className="h-3 w-3" /> Cancelar
        </button>
        <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 transition-colors">
          <Check className="h-3 w-3" /> Guardar
        </button>
      </div>
    </form>
  );
}

function CostRow({ cost, onEdit, onDelete }: {
  cost: Cost;
  onEdit: (c: Cost) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);

  async function handleSave(data: Partial<Cost>) {
    const res = await fetch(`/api/costs/${cost.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const updated = await res.json();
    onEdit(updated);
    setEditing(false);
  }

  if (editing) {
    return (
      <tr className="bg-surface">
        <td colSpan={7} className="px-4 py-4">
          <CostForm initial={cost} onSave={handleSave} onCancel={() => setEditing(false)} />
        </td>
      </tr>
    );
  }

  return (
    <tr className="bg-surface hover:bg-primary/5 transition-colors group">
      <td className="px-4 py-3">
        <p className="font-medium text-text-primary text-sm">{cost.name}</p>
        {cost.notes && <p className="text-xs text-text-muted mt-0.5">{cost.notes}</p>}
      </td>
      <td className="px-4 py-3">
        <Badge variant={CATEGORY_VARIANT[cost.category] ?? "secondary"}>{cost.category}</Badge>
      </td>
      <td className="px-4 py-3">
        <Badge variant={TYPE_VARIANT[cost.type] ?? "secondary"}>{cost.type}</Badge>
      </td>
      <td className="px-4 py-3 text-xs text-text-muted">{cost.frequency}</td>
      <td className="px-4 py-3 text-sm font-semibold tabular-nums text-text-primary">
        {fmtAmount(cost.amount, cost.currency)}
      </td>
      <td className="px-4 py-3 text-xs text-text-muted">
        {cost.paidAt ? new Date(cost.paidAt).toLocaleDateString("es-AR") : "—"}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditing(true)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-border/60 text-text-muted hover:text-text-primary transition-colors">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onDelete(cost.id)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function CostosClient() {
  const [costs, setCosts] = useState<Cost[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");

  const load = useCallback(() => {
    const p = new URLSearchParams();
    if (filterCategory) p.set("category", filterCategory);
    fetch(`/api/costs?${p}`)
      .then((r) => r.json())
      .then((d) => { setCosts(d); setLoading(false); })
      .catch(console.error);
  }, [filterCategory]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  async function handleAdd(data: Partial<Cost>) {
    const res = await fetch("/api/costs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const c = await res.json();
    setCosts((prev) => [c, ...prev]);
    setAdding(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este costo?")) return;
    await fetch(`/api/costs/${id}`, { method: "DELETE" });
    setCosts((prev) => prev.filter((c) => c.id !== id));
  }

  function handleEdit(updated: Cost) {
    setCosts((prev) => prev.map((c) => c.id === updated.id ? updated : c));
  }

  // KPIs
  const mensualUSD = costs
    .filter((c) => c.frequency !== "Única vez")
    .reduce((s, c) => s + toMonthlyUSD(c), 0);
  const suscripciones = costs.filter((c) => c.type === "Suscripción").length;
  const anualUSD = mensualUSD * 12;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border flex-wrap">
        <select
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
          value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors ml-auto"
        >
          <Plus className="h-4 w-4" /> Agregar costo
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* KPI cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wide">Gasto mensual</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-danger/10">
                <TrendingDown className="h-3.5 w-3.5 text-danger" />
              </div>
            </div>
            <p className="text-2xl font-bold tabular-nums text-text-primary">${mensualUSD.toFixed(0)}<span className="text-sm font-normal text-text-muted ml-1">USD</span></p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wide">Proyección anual</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-warning/10">
                <DollarSign className="h-3.5 w-3.5 text-warning" />
              </div>
            </div>
            <p className="text-2xl font-bold tabular-nums text-text-primary">${anualUSD.toFixed(0)}<span className="text-sm font-normal text-text-muted ml-1">USD</span></p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-muted uppercase tracking-wide">Suscripciones</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <RefreshCw className="h-3.5 w-3.5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold tabular-nums text-text-primary">{suscripciones}</p>
          </div>
        </div>

        {/* Add form */}
        {adding && (
          <div className="rounded-xl border border-primary/40 bg-surface p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Nuevo costo
            </h3>
            <CostForm onSave={handleAdd} onCancel={() => setAdding(false)} />
          </div>
        )}

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          {loading ? (
            <p className="text-sm text-text-muted text-center py-12">Cargando...</p>
          ) : costs.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16">
              <DollarSign className="h-10 w-10 text-text-muted opacity-30" />
              <p className="text-sm text-text-muted">No hay costos registrados</p>
              <button onClick={() => setAdding(true)} className="text-xs text-primary hover:underline">Agregar el primero</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface/50">
                    {["Nombre", "Categoría", "Tipo", "Frecuencia", "Monto", "Último pago", ""].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {costs.map((c) => (
                    <CostRow key={c.id} cost={c} onEdit={handleEdit} onDelete={handleDelete} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
