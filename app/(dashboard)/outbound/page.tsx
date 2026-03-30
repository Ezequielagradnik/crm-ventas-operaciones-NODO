import { Header } from "@/components/layout/header";
import { OutboundTabs } from "./outbound-tabs";

export default function OutboundPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="Outbound" description="Tracker de outreach y templates de mensajes" />
      <OutboundTabs />
    </div>
  );
}
