import type { Metadata } from "next";

import { AreaHome } from "@/components/area-home";

export const metadata: Metadata = { title: "Agent dashboard | Shipora" };

export default function AgentPage() {
  return <AreaHome role="AGENT" />;
}
