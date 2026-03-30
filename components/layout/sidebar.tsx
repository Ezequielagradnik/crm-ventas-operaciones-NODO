"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Kanban,
  CheckSquare,
  Send,
  Settings,
  LogOut,
  UserCheck,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NodoLogo } from "@/components/brand/nodo-logo";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/deals", label: "Pipeline", icon: Kanban },
  { href: "/clientes", label: "Clientes", icon: UserCheck },
  { href: "/tareas", label: "Tareas", icon: CheckSquare },
  { href: "/outbound", label: "Outbound", icon: Send },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <TooltipProvider delayDuration={300}>
      <aside className="flex h-screen w-14 flex-col items-center border-r border-border bg-surface py-3 fixed left-0 top-0 z-40 xl:w-56 xl:items-start">
        {/* Logo */}
        <div className="flex items-center justify-center xl:justify-start xl:px-2 xl:mb-1">
          <NodoLogo variant="icon" size={32} className="xl:hidden" />
          <NodoLogo variant="sidebar" size={32} className="hidden xl:flex" />
        </div>

        {/* Nav */}
        <nav className="mt-6 flex flex-1 flex-col gap-1 w-full px-1.5" aria-label="Navegación principal">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);

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
                <TooltipContent side="right" className="xl:hidden">
                  {label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* User */}
        <div className="mt-auto w-full px-1.5">
          <div className="flex items-center gap-2.5 rounded-lg p-2 xl:px-2.5">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback>
                {session?.user?.name ? getInitials(session.user.name) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden xl:flex flex-1 flex-col min-w-0">
              <span className="text-xs font-medium text-text-primary truncate">
                {session?.user?.name ?? "Usuario"}
              </span>
              <span className="text-xs text-text-muted truncate">
                {session?.user?.email ?? ""}
              </span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  aria-label="Cerrar sesión"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Cerrar sesión</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
