import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { LeadDetailClient } from "./lead-detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <div className="flex flex-col h-full">
      <Header title="Detalle del Lead" />
      <LeadDetailClient id={id} />
    </div>
  );
}
