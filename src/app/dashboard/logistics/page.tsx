import ModulePage from "@/components/shared/module-page";
import { logisticsLinks } from "@/lib/admin-modules";

export default function LogisticsPage() {
  return (
    <ModulePage
      eyebrow="Logistics"
      title="Logistics"
      description="Manage collection trips, vehicles and coffee weight reconciliation."
      links={logisticsLinks}
    />
  );
}
