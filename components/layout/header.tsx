"use client";

import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCommandPalette } from "@/components/command-palette/provider";

interface HeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function Header({ title, description, action }: HeaderProps) {
  const { open } = useCommandPalette();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="min-w-0">
        <h1 className="text-sm font-semibold text-text-primary truncate">{title}</h1>
        {description && (
          <p className="text-xs text-text-muted truncate">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={open}
          aria-label="Buscar (Cmd+K)"
          className="hidden sm:flex h-8 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-xs text-text-muted hover:border-primary/50 hover:text-text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Search className="h-3 w-3" aria-hidden="true" />
          <span>Buscar…</span>
          <kbd className="ml-1 rounded border border-border bg-background px-1 py-0.5 text-[10px] font-mono text-text-muted">
            ⌘K
          </kbd>
        </button>
        <button
          onClick={open}
          aria-label="Buscar"
          className="sm:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-text-muted hover:border-primary/50 hover:text-text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        {action && (
          <Button size="sm" onClick={action.onClick}>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{action.label}</span>
          </Button>
        )}
      </div>
    </header>
  );
}
