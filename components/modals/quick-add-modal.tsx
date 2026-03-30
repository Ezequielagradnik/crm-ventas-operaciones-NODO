"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Mode = "lead" | "task";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: Mode;
}

export function QuickAddModal({ isOpen, onClose, defaultMode = "task" }: QuickAddModalProps) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [loading, setLoading] = useState(false);

  // Lead fields
  const [leadName, setLeadName] = useState("");
  const [leadCompany, setLeadCompany] = useState("");

  // Task fields
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState("Media");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "lead") {
        await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: leadName, company: leadCompany }),
        });
        setLeadName("");
        setLeadCompany("");
      } else {
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: taskTitle, priority: taskPriority }),
        });
        setTaskTitle("");
        setTaskPriority("Media");
      }
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Agregar rápido</DialogTitle>
        </DialogHeader>

        <div className="flex gap-1 rounded-lg bg-background p-0.5 border border-border">
          {(["task", "lead"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                mode === m ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {m === "task" ? "Tarea" : "Lead"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "lead" ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="qa-lead-name">Nombre *</Label>
                <Input
                  id="qa-lead-name"
                  placeholder="Nombre del contacto"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qa-lead-company">Empresa</Label>
                <Input
                  id="qa-lead-company"
                  placeholder="Nombre de la empresa"
                  value={leadCompany}
                  onChange={(e) => setLeadCompany(e.target.value)}
                  autoComplete="organization"
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="qa-task-title">Tarea *</Label>
                <Input
                  id="qa-task-title"
                  placeholder="Descripción de la tarea"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qa-task-priority">Prioridad</Label>
                <Select value={taskPriority} onValueChange={setTaskPriority}>
                  <SelectTrigger id="qa-task-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Guardando…" : "Guardar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
