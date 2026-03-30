"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Kanban, CheckSquare, Send, Settings, UserCheck, BookMarked,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NodoLogo } from "@/components/brand/nodo-logo";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/deals", label: "Pipeline", icon: Kanban },
  { href: "/clientes", label: "Clientes", icon: UserCheck },
  { href: "/tareas", label: "Tareas", icon: CheckSquare },
  { href: "/outbound", label: "Outbound", icon: Send },
  { href: "/skills", label: "Claude Skills", icon: BookMarked },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={300}>
      <aside className="flex h-screen w-14 flex-col items-center border-r border-border bg-surface py-3 fixed left-0 top-0 z-40 xl:w-56 xl:items-start">
        <div className="flex items-center justify-center xl:justify-start xl:px-2 xl:mb-1">
          <NodoLogo variant="icon" size={32} className="xl:hidden" />
          <NodoLogo variant="sidebar" size={32} className="hidden xl:flex" />
        </div>

        <nav className="mt-6 flex flex-1 flex-col gap-1 w-full px-1.5" aria-label="Navegación principal">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
            return (
              <Tooltip key={href}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    aria-label={label}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "text-text-secondary hover:bg-primary/10 hover:text-text-primary"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="hidden xl:block truncate">{label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="xl:hidden">{label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
