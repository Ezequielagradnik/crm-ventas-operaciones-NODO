import { Header } from "@/components/layout/header";
import { DealsClient } from "./deals-client";

export default function DealsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Pipeline" description="Deals activos" />
      <DealsClient />
    </div>
  );
}
