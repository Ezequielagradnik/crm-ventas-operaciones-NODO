import { Header } from "@/components/layout/header";
import { ClientesClient } from "./clientes-client";

export default function ClientesPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Clientes" description="Clientes activos de NODO" />
      <ClientesClient />
    </div>
  );
}
