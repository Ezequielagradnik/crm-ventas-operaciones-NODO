"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Link2, Building2, Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatRelativeTime, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Activity {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

interface LeadDetail {
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
  owner: { id: string; name: string };
  createdAt: string;
  deals: Array<{ id: string; company: string; stage: string; value: number }>;
  tasks: Array<{ id: string; title: string; status: string; priority: string }>;
  activities: Activity[];
}

const statusVariant: Record<string, "default" | "info" | "warning" | "success" | "danger" | "secondary"> = {
  Nuevo: "default",
  Contactado: "info",
  "En conversación": "warning",
  Calificado: "success",
  Descartado: "danger",
};

const activityIcon: Record<string, string> = {
  lead_created: "✦",
  lead_status_changed: "⟳",
  deal_created: "◈",
  deal_moved: "→",
  note_added: "✎",
};

export function LeadDetailClient({ id }: { id: string }) {
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/leads/${id}`)
      .then(r => r.json())
      .then(data => { setLead(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function convertToDeal() {
    if (!lead) return;
    await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company: lead.company ?? lead.name, service: "Consultoría", leadId: lead.id, ownerId: lead.owner.id }),
    });
    const updated = await fetch(`/api/leads/${id}`).then(r => r.json());
    setLead(updated);
  }

  if (loading) return <div className="flex flex-1 items-center justify-center p-8"><span className="text-sm text-text-muted">Cargando…</span></div>;
  if (!lead) return <div className="flex flex-1 items-center justify-center p-8"><span className="text-sm text-text-muted">Lead no encontrado</span></div>;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/leads" className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Leads
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback>{getInitials(lead.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-text-primary truncate">{lead.name}</h2>
                  {lead.company && (
                    <p className="flex items-center gap-1 text-sm text-text-secondary">
                      <Building2 className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">{lead.company}</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={statusVariant[lead.status] ?? "secondary"}>{lead.status}</Badge>
                <Button size="sm" variant="secondary" onClick={convertToDeal}>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Crear deal</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {lead.email && (
                <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                  <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate min-w-0">{lead.email}</span>
                </a>
              )}
              {lead.phone && (
                <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                  <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{lead.phone}</span>
                </a>
              )}
              {lead.linkedin && (
                <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                  <Link2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">LinkedIn</span>
                </a>
              )}
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{formatDate(lead.createdAt)}</span>
              </div>
            </div>

            {lead.notes && (
              <div className="mt-4 rounded-lg bg-background p-3 border border-border">
                <p className="text-xs font-medium text-text-muted mb-1">Notas</p>
                <p className="text-sm text-text-secondary whitespace-pre-wrap">{lead.notes}</p>
              </div>
            )}
          </div>

          {/* Deals */}
          {lead.deals.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Deals</h3>
              <ul className="space-y-2">
                {lead.deals.map(deal => (
                  <li key={deal.id} className="flex items-center justify-between rounded-lg bg-background p-3 border border-border">
                    <span className="font-medium text-sm text-text-primary">{deal.company}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs tabular-nums text-text-muted">${deal.value.toLocaleString()}</span>
                      <Badge variant="secondary">{deal.stage}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar: meta + timeline */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-3">Detalles</h3>
            <dl className="space-y-2.5">
              {[
                { label: "Origen", value: lead.origin },
                { label: "Vertical", value: lead.vertical },
                { label: "Owner", value: lead.owner.name },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-2">
                  <dt className="text-xs text-text-muted">{label}</dt>
                  <dd className="text-xs font-medium text-text-primary text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-3">Actividad</h3>
            {lead.activities.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-3">Sin actividad</p>
            ) : (
              <ol className="space-y-3">
                {lead.activities.map(act => (
                  <li key={act.id} className="flex gap-2.5">
                    <span className="mt-0.5 text-xs text-primary shrink-0" aria-hidden="true">
                      {activityIcon[act.type] ?? "·"}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-text-primary leading-snug">{act.message}</p>
                      <time className="text-[10px] text-text-muted" dateTime={act.createdAt}>
                        {formatRelativeTime(act.createdAt)}
                      </time>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
