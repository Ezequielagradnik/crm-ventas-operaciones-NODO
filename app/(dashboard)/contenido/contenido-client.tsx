"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Check, ExternalLink, Sparkles, Video, Image, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PLATFORMS = ["LinkedIn", "Instagram", "TikTok"];
const STATUSES = ["Idea", "En proceso", "Diseñando", "Programado", "Publicado"];
const FORMATS = ["Post", "Carrusel", "Reel / Video", "Historia", "Newsletter"];

const PLATFORM_STYLE: Record<string, { color: string; bg: string; dot: string }> = {
  LinkedIn: { color: "text-[#0A66C2]", bg: "bg-[#0A66C2]/10", dot: "bg-[#0A66C2]" },
  Instagram: { color: "text-[#E1306C]", bg: "bg-[#E1306C]/10", dot: "bg-[#E1306C]" },
  TikTok: { color: "text-white", bg: "bg-white/10", dot: "bg-white" },
};

const STATUS_VARIANT: Record<string, "secondary" | "warning" | "info" | "default" | "success"> = {
  Idea: "secondary",
  "En proceso": "warning",
  Diseñando: "info",
  Programado: "default",
  Publicado: "success",
};

const FORMAT_ICON: Record<string, React.ElementType> = {
  "Post": FileText,
  "Carrusel": Image,
  "Reel / Video": Video,
  "Historia": Image,
  "Newsletter": FileText,
};

interface Post {
  id: string;
  title: string;
  idea: string;
  platform: string;
  status: string;
  canvaUrl: string | null;
  hook: string | null;
  cta: string | null;
  format: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdBy: { id: string; name: string } | null;
  createdAt: string;
}

function PostForm({ initial, onSave, onCancel }: {
  initial?: Partial<Post>;
  onSave: (d: Partial<Post>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    idea: initial?.idea ?? "",
    platform: initial?.platform ?? "LinkedIn",
    status: initial?.status ?? "Idea",
    format: initial?.format ?? "Post",
    hook: initial?.hook ?? "",
    cta: initial?.cta ?? "",
    canvaUrl: initial?.canvaUrl ?? "",
    scheduledAt: initial?.scheduledAt ? new Date(initial.scheduledAt).toISOString().slice(0, 10) : "",
  });

  function set(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.idea) return;
    onSave({
      title: form.title,
      idea: form.idea,
      platform: form.platform,
      status: form.status,
      format: form.format,
      hook: form.hook || null,
      cta: form.cta || null,
      canvaUrl: form.canvaUrl || null,
      scheduledAt: form.scheduledAt || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1 col-span-2">
          <label className="text-xs font-medium text-text-muted">Título *</label>
          <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            value={form.title} onChange={(e) => set("title", e.target.value)}
            placeholder="Ej: Cómo automatizamos el onboarding de clientes" required autoFocus />
        </div>
        <div className="space-y-1 col-span-2">
          <label className="text-xs font-medium text-text-muted">Idea / Descripción *</label>
          <textarea className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none resize-none"
            value={form.idea} onChange={(e) => set("idea", e.target.value)}
            placeholder="¿De qué trata la publicación? ¿Qué querés transmitir?" rows={3} required />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-muted">Plataforma</label>
          <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            value={form.platform} onChange={(e) => set("platform", e.target.value)}>
            {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-muted">Formato</label>
          <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            value={form.format} onChange={(e) => set("format", e.target.value)}>
            {FORMATS.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-muted">Estado</label>
          <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            value={form.status} onChange={(e) => set("status", e.target.value)}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-muted">Fecha programada</label>
          <input type="date" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            value={form.scheduledAt} onChange={(e) => set("scheduledAt", e.target.value)} />
        </div>
        <div className="space-y-1 col-span-2">
          <label className="text-xs font-medium text-text-muted">Hook (primera línea que engancha)</label>
          <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            value={form.hook} onChange={(e) => set("hook", e.target.value)}
            placeholder="Ej: El 80% de las empresas pierden tiempo en tareas que se pueden automatizar..." />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-muted">CTA</label>
          <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            value={form.cta} onChange={(e) => set("cta", e.target.value)}
            placeholder="Ej: Escribime y te cuento más" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-muted">Link de Canva</label>
          <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none font-mono text-xs"
            value={form.canvaUrl} onChange={(e) => set("canvaUrl", e.target.value)}
            placeholder="https://canva.com/design/..." />
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

function PostCard({ post, onEdit, onDelete, onStatusChange }: {
  post: Post;
  onEdit: (p: Post) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const style = PLATFORM_STYLE[post.platform] ?? PLATFORM_STYLE.LinkedIn;
  const FormatIcon = FORMAT_ICON[post.format] ?? FileText;

  async function handleSave(data: Partial<Post>) {
    await fetch(`/api/content/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    onEdit({ ...post, ...data } as Post);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-primary/40 bg-surface p-4">
        <PostForm initial={post} onSave={handleSave} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  const nextStatus = STATUSES[STATUSES.indexOf(post.status) + 1];

  return (
    <div className="group rounded-xl border border-border bg-surface hover:border-primary/30 transition-all flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", style.bg, style.color)}>
            {post.platform}
          </span>
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <FormatIcon className="h-3 w-3" />
            {post.format}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setEditing(true)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-border/60 text-text-muted hover:text-text-primary transition-colors">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onDelete(post.id)} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 flex-1 space-y-2">
        <h3 className="text-sm font-semibold text-text-primary leading-snug">{post.title}</h3>
        <p className="text-xs text-text-muted leading-relaxed line-clamp-2">{post.idea}</p>
        {post.hook && (
          <div className="rounded-lg bg-primary/5 border border-primary/15 px-3 py-2">
            <p className="text-[10px] font-medium text-primary uppercase tracking-wide mb-0.5">Hook</p>
            <p className="text-xs text-text-secondary italic leading-relaxed">"{post.hook}"</p>
          </div>
        )}
        {post.cta && (
          <p className="text-xs text-text-muted"><span className="text-text-secondary font-medium">CTA:</span> {post.cta}</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 pt-2 space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant={STATUS_VARIANT[post.status] ?? "secondary"}>{post.status}</Badge>
          {post.scheduledAt && (
            <span className="text-[10px] text-text-muted">
              {new Date(post.scheduledAt).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {post.canvaUrl && (
            <a href={post.canvaUrl} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-xs text-text-secondary hover:text-text-primary hover:border-primary/40 transition-colors">
              <ExternalLink className="h-3 w-3" /> Abrir Canva
            </a>
          )}
          {nextStatus && (
            <button onClick={() => onStatusChange(post.id, nextStatus)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
              <Check className="h-3 w-3" /> → {nextStatus}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ContenidoClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const load = useCallback(() => {
    const p = new URLSearchParams();
    if (filterPlatform) p.set("platform", filterPlatform);
    if (filterStatus) p.set("status", filterStatus);
    fetch(`/api/content?${p}`)
      .then((r) => r.json())
      .then((d) => { setPosts(d); setLoading(false); })
      .catch(console.error);
  }, [filterPlatform, filterStatus]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  async function handleAdd(data: Partial<Post>) {
    await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setAdding(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta idea?")) return;
    await fetch(`/api/content/${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  function handleEdit(updated: Post) {
    setPosts((prev) => prev.map((p) => p.id === updated.id ? updated : p));
  }

  async function handleStatusChange(id: string, status: string) {
    const body: Record<string, unknown> = { status };
    if (status === "Publicado") body.publishedAt = new Date().toISOString();
    await fetch(`/api/content/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    load();
  }

  // Stats
  const byPlatform = PLATFORMS.map((p) => ({ platform: p, count: posts.filter((x) => x.platform === p).length }));
  const published = posts.filter((p) => p.status === "Publicado").length;
  const inProgress = posts.filter((p) => p.status !== "Publicado" && p.status !== "Idea").length;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border flex-wrap">
        <div className="flex items-center gap-2">
          {PLATFORMS.map((p) => {
            const style = PLATFORM_STYLE[p];
            const count = byPlatform.find((x) => x.platform === p)?.count ?? 0;
            return (
              <button key={p} onClick={() => setFilterPlatform(filterPlatform === p ? "" : p)}
                className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors border",
                  filterPlatform === p ? `${style.bg} ${style.color} border-transparent` : "border-border text-text-muted hover:text-text-primary")}>
                <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
                {p} {count > 0 && <span className="opacity-60">({count})</span>}
              </button>
            );
          })}
        </div>
        <select className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
          value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors ml-auto">
          <Plus className="h-4 w-4" /> Nueva idea
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Mini stats */}
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span><span className="text-text-primary font-semibold">{posts.length}</span> ideas totales</span>
          <span><span className="text-warning font-semibold">{inProgress}</span> en proceso</span>
          <span><span className="text-success font-semibold">{published}</span> publicadas</span>
        </div>

        {/* Add form */}
        {adding && (
          <div className="rounded-xl border border-primary/40 bg-surface p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Nueva idea de contenido
            </h3>
            <PostForm onSave={handleAdd} onCancel={() => setAdding(false)} />
          </div>
        )}

        {loading ? (
          <p className="text-sm text-text-muted text-center py-12">Cargando...</p>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <Sparkles className="h-10 w-10 text-text-muted opacity-30" />
            <p className="text-sm text-text-muted">No hay ideas todavía</p>
            <button onClick={() => setAdding(true)} className="text-xs text-primary hover:underline">Crear la primera</button>
          </div>
        ) : (
          /* Kanban-style columns by status */
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 xl:grid-cols-5">
            {STATUSES.map((status) => {
              const items = posts.filter((p) => p.status === status);
              if (items.length === 0 && !["Idea", "En proceso", "Publicado"].includes(status)) return null;
              return (
                <div key={status} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">{status}</h2>
                    {items.length > 0 && <span className="text-[10px] text-text-muted/60 rounded-full bg-border/60 px-1.5 py-0.5">{items.length}</span>}
                  </div>
                  {items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/40 py-6 flex items-center justify-center">
                      <p className="text-xs text-text-muted/40">Vacío</p>
                    </div>
                  ) : (
                    items.map((post) => (
                      <PostCard key={post.id} post={post} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
                    ))
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
