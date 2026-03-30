import { Header } from "@/components/layout/header";
import { SkillsClient } from "./skills-client";

export default function SkillsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Claude Skills" description="Repositorio de skills y herramientas de IA" />
      <SkillsClient />
    </div>
  );
}
