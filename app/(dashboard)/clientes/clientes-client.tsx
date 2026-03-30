"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, UserCheck, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate, CLIENT_PLANS, CLIENT_STATUSES } from "@/lib/utils";

interface Client {
  id: string;
  company: string;
  contact: string;
  email?: string | null;
  plan: string;
  mrr: number;
  status: string;
  services?: string | null;
  nextReview?: string | null;
  notes?: string | null;
  createdAt: string;
}

const statusVariant: Record<string, "success" | "warning" | "danger"> = {
  Activo: "success",
  Pausado: "warning",
  Churned: "danger",
};

const planVariant: Record<string, "default" | "info" | "warning"> = {
  Starter: "default",
  Growth: "info",
  Enterprise: "warning",
};

function ClientForm({ client, onSave, onClose }: { client?: Partial<Client>; onSave: (d: Partial<Client>) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState({
    company: client?.company ?? "", contact: client?.contact ?? "",
    email: client?.email ?? "", plan: client?.plan ?? "Starter",
    mrr: String(client?.mrr ?? ""), status: client?.status ?? "Activo",
    services: client?.services ?? "", nextReview: client?.nextReview ? new Date(client.nextReview).toISOString().slice(0, 10) : "",
    notes: client?.notes ?? "",
  });
  const [loading, setLoading] = useState(false);
  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try { await onSave({ ...form, mrr: parseFloat(form.mrr) || 0, nextReview: form.nextReview || null }); }
    finally { setLoading(false); }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="cf-company">Empresa *</Label>
          <Input id="cf-company" value={form.company} onChange={e => set("company", e.target.value)} required autoComplete="organization" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cf-contact">Contacto *</Label>
          <Input id="cf-contact" value={form.contact} onChange={e => set("contact", e.target.value)} required autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cf-email">Email</Label>
          <Input id="cf-email" type="email" value={form.email} onChange={e => set("email", e.target.value)} autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cf-mrr">MRR (USD)</Label>
          <Input id="cf-mrr" type="number" min="0" step="50" value={form.mrr} onChange={e => set("mrr", e.target.value)} placeholder="0" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cf-plan">Plan</Label>
          <Select value={form.plan} onValueChange={v => set("plan", v)}>
            <SelectTrigger id="cf-plan"><SelectValue /></SelectTrigger>
            <SelectContent>{CLIENT_PLANS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cf-status">Estado</Label>
          <Select value={form.status} onValueChange={v => set("status", v)}>
            <SelectTrigger id="cf-status"><SelectValue /></SelectTrigger>
            <SelectContent>{CLIENT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cf-services">Servicios</Label>
          <Input id="cf-services" value={form.services} onChange={e => set("services", e.target.value)} placeholder="Agente de atención…" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cf-review">Próxima review</Label>
          <Input id="cf-review" type="date" value={form.nextReview} onChange={e => set("nextReview", e.target.value)} />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="cf-notes">Notas</Label>
          <Textarea id="cf-notes" value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? "Guardando…" : "Guardar"}</Button>
      </DialogFooter>
    </form>
  );
}

export function ClientesClient() {
  const [clients, setClients] = useState<Client[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | undefined>();
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchClients = useCallback(() => {
    const params = filterStatus !== "all" ? `?status=${filterStatus}` : "";
    fetch(`/api/clients${params}`).then(r => r.json()).then(setClients).catch(console.error);
  }, [filterStatus]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const totalMrr = clients.filter(c => c.status === "Activo").reduce((s, c) => s + c.mrr, 0);

  async function handleSave(data: Partial<Client>) {
    if (editing) {
      await fetch(`/api/clients/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    } else {
      await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    }
    setModalOpen(false);
    setEditing(undefined);
    fetchClients();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este cliente?")) return;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    fetchClients();
  }

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
          <TrendingUp className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <span className="text-xs text-text-muted">MRR total:</span>
          <span className="text-sm font-semibold tabular-nums text-text-primary">{formatCurrency(totalMrr)}</span>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32" aria-label="Filtrar por estado">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {CLIENT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="ml-auto">
          <Button size="sm" onClick={() => { setEditing(undefined); setModalOpen(true); }}>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Nuevo cliente
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        {clients.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16">
            <UserCheck className="h-10 w-10 text-text-muted opacity-30" aria-hidden="true" />
            <p className="text-sm text-text-muted">No hay clientes registrados</p>
            <Button size="sm" variant="outline" onClick={() => setModalOpen(true)}>Agregar primero</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  {["Empresa", "Plan", "MRR", "Estado", "Próxima review", "Acciones"].map(h => (
                    <th key={h} scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-text-muted first:table-cell hidden sm:table-cell last:table-cell">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clients.map(client => (
                  <tr key={client.id} className="bg-surface hover:bg-primary/5 transition-colors group">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary truncate min-w-0">{client.company}</p>
                      <p className="text-xs text-text-muted truncate">{client.contact}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge variant={planVariant[client.plan] ?? "default"}>{client.plan}</Badge>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="font-semibold tabular-nums text-success">{formatCurrency(client.mrr)}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge variant={statusVariant[client.status] ?? "secondary"}>{client.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted hidden sm:table-cell tabular-nums">
                      {client.nextReview ? formatDate(client.nextReview) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon-sm" variant="ghost" onClick={() => { setEditing(client); setModalOpen(true); }} aria-label={`Editar ${client.company}`}>
                          <span className="text-xs">✎</span>
                        </Button>
                        <button
                          onClick={() => handleDelete(client.id)}
                          aria-label={`Eliminar ${client.company}`}
                          className="hidden group-hover:flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:text-danger hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={o => { if (!o) { setModalOpen(false); setEditing(undefined); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
          </DialogHeader>
          <ClientForm client={editing} onSave={handleSave} onClose={() => { setModalOpen(false); setEditing(undefined); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
