"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Filter, ExternalLink, Trash2, ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, LEAD_STATUSES, LEAD_ORIGINS, LEAD_VERTICALS, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Lead {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedin?: string | null;
  origin: string;
  vertical: string;
  status: string;
  notes?: string | null;
  ownerId: string;
  owner: { id: string; name: string };
  createdAt: string;
}

interface User {
  id: string;
  name: string;
}

const statusVariant: Record<string, "default" | "info" | "warning" | "success" | "danger" | "secondary" | "muted"> = {
  Nuevo: "default",
  Contactado: "info",
  "En conversación": "warning",
  Calificado: "success",
  Descartado: "danger",
};

function LeadForm({
  lead,
  users,
  onSave,
  onClose,
}: {
  lead?: Partial<Lead>;
  users: User[];
  onSave: (data: Partial<Lead>) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: lead?.name ?? "",
    company: lead?.company ?? "",
    email: lead?.email ?? "",
    phone: lead?.phone ?? "",
    linkedin: lead?.linkedin ?? "",
    origin: lead?.origin ?? "Otro",
    vertical: lead?.vertical ?? "Otro",
    status: lead?.status ?? "Nuevo",
    notes: lead?.notes ?? "",
    ownerId: lead?.ownerId ?? (users[0]?.id ?? ""),
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(form);
    } finally {
      setLoading(false);
    }
  }

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="lf-name">Nombre *</Label>
          <Input id="lf-name" value={form.name} onChange={(e) => set("name", e.target.value)} required autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lf-company">Empresa</Label>
          <Input id="lf-company" value={form.company} onChange={(e) => set("company", e.target.value)} autoComplete="organization" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lf-email">Email</Label>
          <Input id="lf-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lf-phone">Teléfono</Label>
          <Input id="lf-phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="lf-linkedin">LinkedIn</Label>
          <Input id="lf-linkedin" value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lf-origin">Origen</Label>
          <Select value={form.origin} onValueChange={(v) => set("origin", v)}>
            <SelectTrigger id="lf-origin"><SelectValue /></SelectTrigger>
            <SelectContent>{LEAD_ORIGINS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lf-vertical">Vertical</Label>
          <Select value={form.vertical} onValueChange={(v) => set("vertical", v)}>
            <SelectTrigger id="lf-vertical"><SelectValue /></SelectTrigger>
            <SelectContent>{LEAD_VERTICALS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lf-status">Estado</Label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger id="lf-status"><SelectValue /></SelectTrigger>
            <SelectContent>{LEAD_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lf-owner">Owner</Label>
          <Select value={form.ownerId} onValueChange={(v) => set("ownerId", v)}>
            <SelectTrigger id="lf-owner"><SelectValue /></SelectTrigger>
            <SelectContent>{users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="lf-notes">Notas</Label>
          <Textarea id="lf-notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? "Guardando…" : "Guardar"}</Button>
      </DialogFooter>
    </form>
  );
}

export function LeadsClient() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterOwner, setFilterOwner] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>();

  const fetchLeads = useCallback(() => {
    const params = new URLSearchParams();
    if (filterStatus !== "all") params.set("status", filterStatus);
    if (filterOwner !== "all") params.set("owner", filterOwner);
    if (search) params.set("search", search);
    fetch(`/api/leads?${params}`).then(r => r.json()).then(setLeads).catch(console.error);
  }, [filterStatus, filterOwner, search]);

  useEffect(() => {
    fetch("/api/users").then(r => r.json()).then(setUsers).catch(() => setUsers([]));
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  async function handleSave(data: Partial<Lead>) {
    if (editingLead) {
      await fetch(`/api/leads/${editingLead.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    } else {
      await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    }
    setModalOpen(false);
    setEditingLead(undefined);
    fetchLeads();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este lead?")) return;
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
    fetchLeads();
  }

  async function convertToDeal(lead: Lead) {
    await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company: lead.company ?? lead.name, service: "Consultoría", leadId: lead.id, ownerId: lead.ownerId }),
    });
    alert("Deal creado en pipeline");
  }

  function openNew() { setEditingLead(undefined); setModalOpen(true); }
  function openEdit(lead: Lead) { setEditingLead(lead); setModalOpen(true); }

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" aria-hidden="true" />
          <Input
            placeholder="Buscar leads…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
            autoComplete="off"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36" aria-label="Filtrar por estado">
            <Filter className="h-3.5 w-3.5 mr-1.5 text-text-muted" aria-hidden="true" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {LEAD_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterOwner} onValueChange={setFilterOwner}>
          <SelectTrigger className="w-32" aria-label="Filtrar por owner">
            <SelectValue placeholder="Owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Nuevo lead
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        {leads.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16">
            <Users className="h-10 w-10 text-text-muted opacity-30" aria-hidden="true" />
            <p className="text-sm text-text-muted">No hay leads</p>
            <Button size="sm" variant="outline" onClick={openNew}>Agregar primero</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">Nombre</th>
                  <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-text-muted hidden sm:table-cell">Origen</th>
                  <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-text-muted hidden md:table-cell">Vertical</th>
                  <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">Estado</th>
                  <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-text-muted hidden lg:table-cell">Owner</th>
                  <th scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-text-muted hidden lg:table-cell">Fecha</th>
                  <th scope="col" className="px-4 py-2.5 text-right text-xs font-medium text-text-muted">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((lead) => (
                  <tr key={lead.id} className="bg-surface hover:bg-primary/5 transition-colors group">
                    <td className="px-4 py-3">
                      <Link href={`/leads/${lead.id}`} className="flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                        <span className="font-medium text-text-primary group-hover:text-primary transition-colors truncate min-w-0">{lead.name}</span>
                        {lead.company && <span className="text-xs text-text-muted truncate">{lead.company}</span>}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden sm:table-cell">
                      <span className="truncate">{lead.origin}</span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden md:table-cell">
                      <span className="truncate">{lead.vertical}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[lead.status] ?? "secondary"}>{lead.status}</Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[9px]">{getInitials(lead.owner.name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-text-secondary">{lead.owner.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted hidden lg:table-cell tabular-nums">{formatDate(lead.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(lead)}
                          aria-label={`Editar ${lead.name}`}
                          className="hidden group-hover:flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:text-text-primary hover:bg-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => convertToDeal(lead)}
                          aria-label={`Convertir ${lead.name} a deal`}
                          title="Convertir a deal"
                          className="hidden group-hover:flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:text-success hover:bg-success/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          aria-label={`Eliminar ${lead.name}`}
                          className="hidden group-hover:flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:text-danger hover:bg-danger/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <Link
                          href={`/leads/${lead.id}`}
                          aria-label={`Ver detalle de ${lead.name}`}
                          className="flex h-7 items-center gap-1 rounded-md px-2 text-xs text-text-muted hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          Ver →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={(o) => { if (!o) { setModalOpen(false); setEditingLead(undefined); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingLead ? "Editar lead" : "Nuevo lead"}</DialogTitle>
          </DialogHeader>
          <LeadForm
            lead={editingLead}
            users={users}
            onSave={handleSave}
            onClose={() => { setModalOpen(false); setEditingLead(undefined); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
