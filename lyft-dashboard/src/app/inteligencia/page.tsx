import type { Metadata } from "next";

import { ThreatIntelModule } from "@/core/composition/ThreatIntelModule";

import { RequireAuth } from "@/modules/auth/presentation/components/RequireAuth";

export const metadata: Metadata = {
  title: "Inteligencia de amenazas · Argus",
};

export default function ThreatIntelPage() {
  return (
    <RequireAuth>
      <ThreatIntelModule />
    </RequireAuth>
  );
}
