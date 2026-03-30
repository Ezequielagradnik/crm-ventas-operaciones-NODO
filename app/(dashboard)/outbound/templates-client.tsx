"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Copy, Check, Pencil, Trash2, X, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CHANNELS = ["LinkedIn", "WhatsApp", "Email", "Instagram"];
const CATEGORIES = ["Primer contacto", "Follow-up", "Propuesta", "Reactivación", "Referido"];

const CHANNEL_VARIANT: Record<string, "default" | "success" | "warning" | "info" | "secondary"> = {
  LinkedIn: "default",
  WhatsApp: "success",
  Email: "info",
  Instagram: "warning",
};

interface Template {
  id: string;
  title: string;
  channel: string;
  body: string;
  category: string;
  createdBy: { id: string; name: string } | null;
  createdAt: string;
}

// Extract {{variable}} placeholders from template body
function extractVars(body: string): string[] {
  const matches = body.match(/\{\{(\w+)\}\}/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(2, -2)))];
}

function fillTemplate(body: string, vars: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || `{{${key}}}`);
}

function TemplateForm({ initial, onSave, onCancel }: {
  initial?: Partial<Template>;
  onSave: (d: Partial<Template>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [channel, setChannel] = useState(initial?.channel ?? "LinkedIn");
  const [category, setCategory] = useState(initial?.category ?? "Primer contacto");
  const [body, setBody] = useState(initial?.body ?? "");

  const vars = extractVars(body);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    onSave({ title: title.trim(), channel, category, body: body.trim() });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1 sm:col-span-3">
          <label className="text-xs font-medium text-text-muted">Título *</label>
          <input
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Primer contacto agencia IA"
            required
            autoFocus
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-muted">Canal</label>
          <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            value={channel} onChange={(e) => setChannel(e.target.value)}>
            {CHANNELS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-text-muted">Categoría</label>
          <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1 sm:col-span-3">
          <label className="text-xs font-medium text-text-muted">
            Mensaje — usá <span className="font-mono text-primary">{"{{nombre}}"}</span>, <span className="font-mono text-primary">{"{{empresa}}"}</span>, etc.
          </label>
          <textarea
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none resize-none font-mono"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={"Hola {{nombre}}, vi que trabajás en {{empresa}}...\n\nEn NODO automatizamos procesos con IA. ¿Tenés 15 min esta semana?"}
            rows={6}
            required
          />
          {vars.length > 0 && (
            <p className="text-[11px] text-text-muted">
              Variables detectadas: {vars.map((v) => <span key={v} className="font-mono text-primary mx-0.5">{`{{${v}}}`}</span>)}
            </p>
          )}
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

function UseTemplateModal({ template, onClose }: { template: Template; onClose: () => void }) {
  const vars = extractVars(template.body);
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(vars.map((v) => [v, ""]))
  );
  const [copied, setCopied] = useState(false);

  const preview = fillTemplate(template.body, values);

  function handleCopy() {
    navigator.clipboard.writeText(preview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">{template.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={CHANNEL_VARIANT[template.channel] ?? "secondary"}>{template.channel}</Badge>
              <span className="text-xs text-text-muted">{template.category}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          {vars.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Completar variables</p>
              <div className="grid grid-cols-2 gap-2">
                {vars.map((v) => (
                  <div key={v} className="space-y-1">
                    <label className="text-xs text-text-muted font-mono">{`{{${v}}}`}</label>
                    <input
                      className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                      value={values[v]}
                      onChange={(e) => setValues((prev) => ({ ...prev, [v]: e.target.value }))}
                      placeholder={v}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Preview</p>
            <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-text-primary whitespace-pre-wrap leading-relaxed min-h-[100px]">
              {preview}
            </div>
          </div>

          <button
            onClick={handleCopy}
            className={`w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors ${
              copied ? "bg-success/20 text-success" : "bg-primary text-white hover:bg-primary/90"
            }`}
          >
            {copied ? <><Check className="h-4 w-4" /> Copiado!</> : <><Copy className="h-4 w-4" /> Copiar mensaje</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ template, onEdit, onDelete, onUse }: {
  template: Template;
  onEdit: (t: Template) => void;
  onDelete: (id: string) => void;
  onUse: (t: Template) => void;
}) {
  const [editing, setEditing] = useState(false);
  const vars = extractVars(template.body);

  async function handleSave(data: Partial<Template>) {
    await fetch(`/api/templates/${template.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, body: data.body }),
    });
    onEdit({ ...template, ...data });
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-primary/40 bg-surface p-4">
        <TemplateForm initial={template} onSave={handleSave} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="group rounded-xl border border-border bg-surface p-4 hover:border-primary/30 transition-all flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={CHANNEL_VARIANT[template.channel] ?? "secondary"}>{template.channel}</Badge>
          <span className="text-xs text-text-muted">{template.category}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => setEditing(true)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-border/60 text-text-muted hover:text-text-primary transition-colors">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onDelete(template.id)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-1">{template.title}</h3>
        <p className="text-xs text-text-muted leading-relaxed line-clamp-3 font-mono whitespace-pre-wrap">{template.body}</p>
      </div>

      {vars.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {vars.map((v) => (
            <span key={v} className="rounded px-1.5 py-0.5 text-[10px] font-mono bg-primary/10 text-primary">{`{{${v}}}`}</span>
          ))}
        </div>
      )}

      <button
        onClick={() => onUse(template)}
        className="mt-auto flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
      >
        <Copy className="h-3.5 w-3.5" /> Usar template
      </button>
    </div>
  );
}

export function TemplatesClient() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [filterChannel, setFilterChannel] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [using, setUsing] = useState<Template | null>(null);

  const load = useCallback(() => {
    const p = new URLSearchParams();
    if (filterChannel) p.set("channel", filterChannel);
    if (filterCategory) p.set("category", filterCategory);
    fetch(`/api/templates?${p}`)
      .then((r) => r.json())
      .then((d) => { setTemplates(d); setLoading(false); })
      .catch(console.error);
  }, [filterChannel, filterCategory]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  async function handleAdd(data: Partial<Template>) {
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, body: data.body }),
    });
    const t = await res.json();
    setTemplates((prev) => [t, ...prev]);
    setAdding(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar template?")) return;
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  function handleEdit(updated: Template) {
    setTemplates((prev) => prev.map((t) => t.id === updated.id ? updated : t));
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border flex-wrap">
        <select
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
          value={filterChannel} onChange={(e) => setFilterChannel(e.target.value)}
        >
          <option value="">Todos los canales</option>
          {CHANNELS.map((c) => <option key={c}>{c}</option>)}
        </select>
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
          <Plus className="h-4 w-4" /> Nuevo template
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {adding && (
          <div className="rounded-xl border border-primary/40 bg-surface p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Nuevo template</h3>
            <TemplateForm onSave={handleAdd} onCancel={() => setAdding(false)} />
          </div>
        )}

        {loading ? (
          <p className="text-sm text-text-muted text-center py-12">Cargando...</p>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <FileText className="h-10 w-10 text-text-muted opacity-30" />
            <p className="text-sm text-text-muted">No hay templates todavía</p>
            <button onClick={() => setAdding(true)} className="text-xs text-primary hover:underline">Crear el primero</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {templates.map((t) => (
              <TemplateCard key={t.id} template={t} onEdit={handleEdit} onDelete={handleDelete} onUse={setUsing} />
            ))}
          </div>
        )}
      </div>

      {using && <UseTemplateModal template={using} onClose={() => setUsing(null)} />}
    </div>
  );
}
