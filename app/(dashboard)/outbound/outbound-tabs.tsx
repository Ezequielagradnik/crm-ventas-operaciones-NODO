"use client";

import { useState } from "react";
import { Send, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { OutboundClient } from "./outbound-client";
import { TemplatesClient } from "./templates-client";

const TABS = [
  { id: "tracker", label: "Tracker", icon: Send },
  { id: "templates", label: "Templates", icon: FileText },
];

export function OutboundTabs() {
  const [tab, setTab] = useState("tracker");

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center gap-1 border-b border-border px-6 pt-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px",
              tab === id
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text-primary"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden">
        {tab === "tracker" ? <OutboundClient /> : <TemplatesClient />}
      </div>
    </div>
  );
}
