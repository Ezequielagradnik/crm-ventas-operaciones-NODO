import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/header";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();
  return (
    <div className="flex flex-col h-full">
      <Header title="Dashboard" description={`Bienvenido, ${session?.user?.name ?? ""}!`} />
      <DashboardClient />
    </div>
  );
}
