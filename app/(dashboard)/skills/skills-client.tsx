"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, ExternalLink, Pencil, Trash2, X, Check, Github, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = ["General", "Automatización", "Datos", "Frontend", "Backend", "Prompts", "Agentes", "Integraciones"];

interface Skill {
  id: string;
  title: string;
  description: string | null;
  url: string;
  category: string;
  tags: string | null;
  createdAt: string;
  addedBy: { id: string; name: string } | null;
}

const categoryColors: Record<string, "primary" | "success" | "warning" | "danger" | "secondary"> = {
  Automatización: "primary",
  Datos: "success",
  Frontend: "warning",
  Backend: "danger",
  Prompts: "primary",
  Agentes: "success",
  Integraciones: "warning",
  General: "secondary",
};

function SkillForm({ initial, onSave, onCancel }: {
  initial?: Partial<Skill>;
  onSave: (data: Partial<Skill>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [category, setCategory] = useState(initial?.category ?? "General");
  const [tags, setTags] = useState(initial?.tags ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    onSave({ title: title.trim(), description: description.trim() || null, url: url.trim(), category, tags: tags.trim() || null });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-text-muted">Título *</label>
          <input
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nombre del skill o repositorio"
            required
            autoFocus
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-text-muted">URL de GitHub *</label>
          <input
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none font-mono"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/..."
            required
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-text-muted">Descripción</label>
          <textarea
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="¿Qué hace este skill? ¿Para qué sirve?"
            rows={2}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-muted">Categoría</label>
          <select
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-text-muted">Tags (separados por coma)</label>
          <input
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="claude, n8n, webhook..."
          />
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

function SkillCard({ skill, onEdit, onDelete }: {
  skill: Skill;
  onEdit: (skill: Skill) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);

  async function handleSave(data: Partial<Skill>) {
    await fetch(`/api/skills/${skill.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    onEdit({ ...skill, ...data });
    setEditing(false);
  }

  const tags = skill.tags ? skill.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  if (editing) {
    return (
      <div className="rounded-xl border border-primary/40 bg-surface p-4">
        <SkillForm initial={skill} onSave={handleSave} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="group rounded-xl border border-border bg-surface p-4 hover:border-primary/30 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Github className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-text-primary truncate">{skill.title}</h3>
              <Badge variant={categoryColors[skill.category] ?? "secondary"}>{skill.category}</Badge>
            </div>
            {skill.description && (
              <p className="mt-1 text-xs text-text-muted leading-relaxed line-clamp-2">{skill.description}</p>
            )}
            <a
              href={skill.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono"
            >
              {skill.url.replace("https://github.com/", "github.com/")}
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span key={tag} className="rounded px-1.5 py-0.5 text-[10px] bg-border/60 text-text-muted">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-border/60 text-text-muted hover:text-text-primary transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(skill.id)}
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {skill.addedBy && (
        <p className="mt-2 text-[10px] text-text-muted">Agregado por {skill.addedBy.name}</p>
      )}
    </div>
  );
}

export function SkillsClient() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (filterCategory) params.set("category", filterCategory);
    if (search) params.set("search", search);
    fetch(`/api/skills?${params}`)
      .then((r) => r.json())
      .then((data) => { setSkills(data); setLoading(false); })
      .catch(console.error);
  }, [filterCategory, search]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  async function handleAdd(data: Partial<Skill>) {
    const res = await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const newSkill = await res.json();
    setSkills((prev) => [newSkill, ...prev]);
    setAdding(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este skill?")) return;
    await fetch(`/api/skills/${id}`, { method: "DELETE" });
    setSkills((prev) => prev.filter((s) => s.id !== id));
  }

  function handleEdit(updated: Skill) {
    setSkills((prev) => prev.map((s) => s.id === updated.id ? updated : s));
  }

  const grouped = CATEGORIES.reduce<Record<string, Skill[]>>((acc, cat) => {
    const items = skills.filter((s) => s.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
          <input
            className="w-full rounded-lg border border-border bg-surface pl-8 pr-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
            placeholder="Buscar skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-text-primary focus:border-primary focus:outline-none"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors ml-auto"
        >
          <Plus className="h-4 w-4" /> Agregar skill
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Add form */}
        {adding && (
          <div className="rounded-xl border border-primary/40 bg-surface p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Nuevo skill</h3>
            <SkillForm onSave={handleAdd} onCancel={() => setAdding(false)} />
          </div>
        )}

        {loading ? (
          <p className="text-sm text-text-muted text-center py-12">Cargando...</p>
        ) : skills.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <Github className="h-10 w-10 text-text-muted opacity-30" />
            <p className="text-sm text-text-muted">No hay skills guardados aún</p>
            <button onClick={() => setAdding(true)} className="text-xs text-primary hover:underline">
              Agregar el primero
            </button>
          </div>
        ) : filterCategory || search ? (
          // Flat view when filtering
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          // Grouped by category
          Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">{cat}</h2>
                <span className="text-xs text-text-muted/60">({items.length})</span>
              </div>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {items.map((skill) => (
                  <SkillCard key={skill.id} skill={skill} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
