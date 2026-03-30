import { Header } from "@/components/layout/header";
import { LeadsClient } from "./leads-client";

export default function LeadsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Leads" description="Gestioná tus prospectos" />
      <LeadsClient />
    </div>
  );
}
