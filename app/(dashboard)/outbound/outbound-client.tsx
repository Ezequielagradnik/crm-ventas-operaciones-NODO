"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, OUTBOUND_CHANNELS, OUTBOUND_RESPONSES } from "@/lib/utils";

interface Outbound {
  id: string;
  contact: string;
  company?: string | null;
  channel: string;
  messageSent: boolean;
  sentDate?: string | null;
  followUpNum: number;
  response: string;
  notes?: string | null;
  ownerId: string;
  owner: { id: string; name: string };
  createdAt: string;
}

interface User { id: string; name: string; }

const responseVariant: Record<string, "success" | "danger" | "warning"> = {
  "Sí": "success", "No": "danger", "Pendiente": "warning",
};

const followUpLabel = ["1er contacto", "2do follow-up", "3er follow-up", "4to follow-up", "5to follow-up"];

function OutboundForm({ item, users, onSave, onClose }: { item?: Partial<Outbound>; users: User[]; onSave: (d: Partial<Outbound>) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState({
    contact: item?.contact ?? "", company: item?.company ?? "",
    channel: item?.channel ?? "Email", messageSent: item?.messageSent ? "true" : "false",
    sentDate: item?.sentDate ? new Date(item.sentDate).toISOString().slice(0, 10) : "",
    followUpNum: String(item?.followUpNum ?? 0),
    response: item?.response ?? "Pendiente",
    notes: item?.notes ?? "",
    ownerId: item?.ownerId ?? (users[0]?.id ?? ""),
  });
  const [loading, setLoading] = useState(false);
  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        ...form,
        messageSent: form.messageSent === "true",
        followUpNum: parseInt(form.followUpNum) || 0,
        sentDate: form.sentDate || null,
      });
    } finally { setLoading(false); }
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="of-contact">Contacto *</Label>
          <Input id="of-contact" value={form.contact} onChange={e => set("contact", e.target.value)} required autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="of-company">Empresa</Label>
          <Input id="of-company" value={form.company} onChange={e => set("company", e.target.value)} autoComplete="organization" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="of-channel">Canal</Label>
          <Select value={form.channel} onValueChange={v => set("channel", v)}>
            <SelectTrigger id="of-channel"><SelectValue /></SelectTrigger>
            <SelectContent>{OUTBOUND_CHANNELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="of-followup">Follow-up #</Label>
          <Select value={form.followUpNum} onValueChange={v => set("followUpNum", v)}>
            <SelectTrigger id="of-followup"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[0, 1, 2, 3, 4].map(n => <SelectItem key={n} value={String(n)}>{followUpLabel[n]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="of-sent">Fecha envío</Label>
          <Input id="of-sent" type="date" value={form.sentDate} onChange={e => set("sentDate", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="of-response">Respuesta</Label>
          <Select value={form.response} onValueChange={v => set("response", v)}>
            <SelectTrigger id="of-response"><SelectValue /></SelectTrigger>
            <SelectContent>{OUTBOUND_RESPONSES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="of-message">¿Mensaje enviado?</Label>
          <Select value={form.messageSent} onValueChange={v => set("messageSent", v)}>
            <SelectTrigger id="of-message"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Sí</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="of-owner">Owner</Label>
          <Select value={form.ownerId} onValueChange={v => set("ownerId", v)}>
            <SelectTrigger id="of-owner"><SelectValue /></SelectTrigger>
            <SelectContent>{users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="of-notes">Notas</Label>
          <Textarea id="of-notes" value={form.notes} onChange={e => set("notes", e.target.value)} rows={2} />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? "Guardando…" : "Guardar"}</Button>
      </DialogFooter>
    </form>
  );
}

export function OutboundClient() {
  const [items, setItems] = useState<Outbound[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Outbound | undefined>();
  const [filterResponse, setFilterResponse] = useState("all");
  const [filterOwner, setFilterOwner] = useState("all");

  const fetchItems = useCallback(() => {
    const params = new URLSearchParams();
    if (filterResponse !== "all") params.set("response", filterResponse);
    if (filterOwner !== "all") params.set("owner", filterOwner);
    fetch(`/api/outbound?${params}`).then(r => r.json()).then(setItems).catch(console.error);
  }, [filterResponse, filterOwner]);

  useEffect(() => {
    fetchItems();
    fetch("/api/users").then(r => r.json()).then(setUsers).catch(() => setUsers([]));
  }, [fetchItems]);

  async function handleSave(data: Partial<Outbound>) {
    if (editing) {
      await fetch(`/api/outbound/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    } else {
      await fetch("/api/outbound", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    }
    setModalOpen(false);
    setEditing(undefined);
    fetchItems();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar?")) return;
    await fetch(`/api/outbound/${id}`, { method: "DELETE" });
    fetchItems();
  }

  async function advanceFollowUp(item: Outbound) {
    await fetch(`/api/outbound/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followUpNum: item.followUpNum + 1, messageSent: true, sentDate: new Date().toISOString() }),
    });
    fetchItems();
  }

  const pendingCount = items.filter(i => i.response === "Pendiente").length;

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
          <Send className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <span className="text-xs text-text-muted">Pendientes de respuesta:</span>
          <span className="text-sm font-semibold tabular-nums text-warning">{pendingCount}</span>
        </div>
        <Select value={filterResponse} onValueChange={setFilterResponse}>
          <SelectTrigger className="w-32 h-8" aria-label="Filtrar por respuesta">
            <SelectValue placeholder="Respuesta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {OUTBOUND_RESPONSES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
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
          Nuevo
        </Button>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16">
            <Send className="h-10 w-10 text-text-muted opacity-30" aria-hidden="true" />
            <p className="text-sm text-text-muted">No hay outreach registrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  {["Contacto", "Canal", "Follow-up", "Enviado", "Respuesta", "Owner", "Acciones"].map(h => (
                    <th key={h} scope="col" className="px-4 py-2.5 text-left text-xs font-medium text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map(item => (
                  <tr key={item.id} className="bg-surface hover:bg-primary/5 transition-colors group">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary truncate">{item.contact}</p>
                      {item.company && <p className="text-xs text-text-muted">{item.company}</p>}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{item.channel}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-text-muted">{followUpLabel[item.followUpNum] ?? `#${item.followUpNum}`}</span>
                    </td>
                    <td className="px-4 py-3">
                      {item.messageSent
                        ? <span className="text-xs text-success">{item.sentDate ? formatDate(item.sentDate) : "Sí"}</span>
                        : <span className="text-xs text-text-muted">No</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={responseVariant[item.response] ?? "secondary"}>{item.response}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">{item.owner.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => advanceFollowUp(item)}
                          aria-label="Avanzar follow-up"
                          title="Siguiente follow-up"
                          className="hidden group-hover:flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                          <Send className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button onClick={() => { setEditing(item); setModalOpen(true); }}
                          aria-label={`Editar ${item.contact}`}
                          className="hidden group-hover:flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                          <span className="text-xs" aria-hidden="true">✎</span>
                        </button>
                        <button onClick={() => handleDelete(item.id)}
                          aria-label={`Eliminar ${item.contact}`}
                          className="hidden group-hover:flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
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
          <DialogHeader><DialogTitle>{editing ? "Editar outreach" : "Nuevo outreach"}</DialogTitle></DialogHeader>
          <OutboundForm item={editing} users={users} onSave={handleSave} onClose={() => { setModalOpen(false); setEditing(undefined); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
