import { Header } from "@/components/layout/header";
import { DashboardClient } from "./dashboard-client";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard" description="Bienvenido a NODO CRM" />
      <DashboardClient />
    </div>
  );
}
