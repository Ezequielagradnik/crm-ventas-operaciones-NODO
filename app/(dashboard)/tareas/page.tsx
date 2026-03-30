import { Header } from "@/components/layout/header";
import { TareasClient } from "./tareas-client";

export default function TareasPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Tareas" description="To-dos de Eze y Tomi" />
      <TareasClient />
    </div>
  );
}
