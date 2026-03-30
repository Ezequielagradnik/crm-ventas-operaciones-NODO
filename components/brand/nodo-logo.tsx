import { cn } from "@/lib/utils";

interface NodoLogoProps {
  /** "icon" = solo el SVG de nodos, "full" = SVG + texto NODO + tagline */
  variant?: "icon" | "full" | "sidebar";
  className?: string;
  size?: number;
}

/**
 * Logo NODO — grafo de nodos violetas conectados por líneas,
 * replicando el branding de la landing de NODO.
 */
export function NodoLogo({ variant = "icon", className, size = 40 }: NodoLogoProps) {
  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Líneas de conexión */}
      <line x1="50" y1="50" x2="22" y2="22" stroke="#6C63FF" strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="50" y1="50" x2="30" y2="75" stroke="#6C63FF" strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="50" y1="50" x2="15" y2="52" stroke="#6C63FF" strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="50" y1="50" x2="72" y2="22" stroke="#6C63FF" strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="50" y1="50" x2="85" y2="48" stroke="#6C63FF" strokeWidth="1.2" strokeOpacity="0.5" />
      <line x1="50" y1="50" x2="72" y2="72" stroke="#6C63FF" strokeWidth="1.2" strokeOpacity="0.5" />

      {/* Nodo central */}
      <circle cx="50" cy="50" r="13" fill="#7C73FF" />

      {/* Nodos satélite */}
      <circle cx="22" cy="22" r="7" fill="#5B54CC" />
      <circle cx="72" cy="22" r="9" fill="#6C63FF" />
      <circle cx="15" cy="52" r="5" fill="#4A44AA" />
      <circle cx="30" cy="75" r="7.5" fill="#6C63FF" />
      <circle cx="72" cy="72" r="8" fill="#5B54CC" />
      <circle cx="85" cy="48" r="5.5" fill="#4A44AA" />
    </svg>
  );

  if (variant === "icon") return <div className={cn("shrink-0", className)}>{icon}</div>;

  if (variant === "sidebar") {
    return (
      <div className={cn("flex items-center gap-2.5", className)}>
        {icon}
        <span className="text-sm font-bold tracking-widest text-white">NODO</span>
      </div>
    );
  }

  // full
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {icon}
      <div className="text-center">
        <p className="text-xl font-bold tracking-[0.25em] text-white">NODO</p>
        <p className="text-[10px] tracking-[0.3em] text-text-muted uppercase mt-0.5">
          AI Agents Studio
        </p>
      </div>
    </div>
  );
}
