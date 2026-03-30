"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, Kanban, UserCheck, CheckSquare, Send, LayoutDashboard, Settings, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: "lead" | "deal" | "client" | "task";
  title: string;
  subtitle?: string;
  href: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const quickLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: Users },
  { label: "Pipeline", href: "/deals", icon: Kanban },
  { label: "Clientes", href: "/clientes", icon: UserCheck },
  { label: "Tareas", href: "/tareas", icon: CheckSquare },
  { label: "Outbound", href: "/outbound", icon: Send },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setActiveIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        setResults(data.results ?? []);
        setActiveIndex(0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [query]);

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
      onClose();
    },
    [router, onClose]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    const items = query ? results : quickLinks;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (query && results[activeIndex]) {
        navigate(results[activeIndex].href);
      } else if (!query && quickLinks[activeIndex]) {
        navigate(quickLinks[activeIndex].href);
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  if (!isOpen) return null;

  const typeLabel: Record<string, string> = {
    lead: "Lead",
    deal: "Deal",
    client: "Cliente",
    task: "Tarea",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/40 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Búsqueda global"
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
          <input
            type="search"
            placeholder="Buscar leads, deals, clientes, tareas…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
            autoComplete="off"
          />
          <kbd className="hidden sm:block rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-text-muted">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-1">
          {!query ? (
            <>
              <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                Navegación rápida
              </p>
              {quickLinks.map(({ label, href, icon: Icon }, i) => (
                <button
                  key={href}
                  onClick={() => navigate(href)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2 text-sm text-text-primary transition-colors",
                    i === activeIndex ? "bg-primary/10 text-primary" : "hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
                  <span className="flex-1 text-left">{label}</span>
                  <ArrowRight className="h-3 w-3 text-text-muted" aria-hidden="true" />
                </button>
              ))}
            </>
          ) : loading ? (
            <p className="px-4 py-6 text-center text-sm text-text-muted">Buscando…</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-text-muted">
              Sin resultados para &ldquo;{query}&rdquo;
            </p>
          ) : (
            results.map((result, i) => (
              <button
                key={result.id}
                onClick={() => navigate(result.href)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors",
                  i === activeIndex ? "bg-primary/10" : "hover:bg-primary/10"
                )}
              >
                <span className="min-w-0 flex-1 text-left">
                  <span className="block truncate font-medium text-text-primary">{result.title}</span>
                  {result.subtitle && (
                    <span className="block truncate text-xs text-text-muted">{result.subtitle}</span>
                  )}
                </span>
                <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] text-text-muted">
                  {typeLabel[result.type] ?? result.type}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
