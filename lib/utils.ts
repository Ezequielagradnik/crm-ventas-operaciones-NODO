import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "ahora";
  if (diffMins < 60) return `hace ${diffMins}m`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays < 7) return `hace ${diffDays}d`;
  return formatDate(date);
}

export function getDaysSince(date: Date | string): number {
  const then = new Date(date);
  const now = new Date();
  return Math.floor((now.getTime() - then.getTime()) / 86400000);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const LEAD_STATUSES = [
  "Nuevo",
  "Contactado",
  "En conversación",
  "Calificado",
  "Descartado",
] as const;

export const LEAD_ORIGINS = [
  "LinkedIn",
  "ML",
  "Referido",
  "Inbound",
  "Otro",
] as const;

export const LEAD_VERTICALS = [
  "E-commerce",
  "Servicios",
  "Educación",
  "Marketing",
  "Otro",
] as const;

export const DEAL_STAGES = [
  "Nuevo contacto",
  "Discovery call agendada",
  "Propuesta enviada",
  "Negociación",
  "Cerrado ganado",
  "Cerrado perdido",
] as const;

export const DEAL_SERVICES = [
  "Agente de atención",
  "Agente de ventas",
  "Automatización",
  "Consultoría",
] as const;

export const DEAL_STAGE_COLORS: Record<string, string> = {
  "Nuevo contacto": "text-primary",
  "Discovery call agendada": "text-info",
  "Propuesta enviada": "text-warning",
  Negociación: "text-orange-400",
  "Cerrado ganado": "text-success",
  "Cerrado perdido": "text-danger",
};

export const CLIENT_PLANS = ["Starter", "Growth", "Enterprise"] as const;
export const CLIENT_STATUSES = ["Activo", "Pausado", "Churned"] as const;

export const TASK_PRIORITIES = ["Alta", "Media", "Baja"] as const;
export const TASK_STATUSES = ["Pendiente", "En progreso", "Completada"] as const;

export const OUTBOUND_CHANNELS = [
  "Email",
  "LinkedIn",
  "WhatsApp",
  "Teléfono",
] as const;
export const OUTBOUND_RESPONSES = ["Sí", "No", "Pendiente"] as const;
