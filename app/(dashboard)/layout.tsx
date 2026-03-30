import { Sidebar } from "@/components/layout/sidebar";
import { CommandPaletteProvider } from "@/components/command-palette/provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CommandPaletteProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto ml-14 xl:ml-56">
          {children}
        </main>
      </div>
    </CommandPaletteProvider>
  );
}
