import { Header } from "@/components/layout/header";
import { ContenidoClient } from "./contenido-client";

export default function ContenidoPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Contenido" description="Ideas y publicaciones para redes sociales" />
      <ContenidoClient />
    </div>
  );
}
