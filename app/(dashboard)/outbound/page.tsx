import { Header } from "@/components/layout/header";
import { OutboundClient } from "./outbound-client";

export default function OutboundPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Outbound" description="Tracker de outreach" />
      <OutboundClient />
    </div>
  );
}
