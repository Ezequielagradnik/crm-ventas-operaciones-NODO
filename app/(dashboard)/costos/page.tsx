import { Header } from "@/components/layout/header";
import { CostosClient } from "./costos-client";

export default function CostosPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Costos" description="Gastos y suscripciones de NODO" />
      <CostosClient />
    </div>
  );
}
