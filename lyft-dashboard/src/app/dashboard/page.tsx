import { DashboardModule } from "@/core/composition/DashboardModule";

import { RequireAuth } from "@/modules/auth/presentation/components/RequireAuth";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardModule />
    </RequireAuth>
  );
}