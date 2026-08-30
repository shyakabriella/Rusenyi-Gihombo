import ModulePage from "@/components/shared/module-page";
import { inventoryLinks } from "@/lib/admin-modules";

export default function InventoryPage() {
  return (
    <ModulePage
      eyebrow="Inventory"
      title="Store & Inventory"
      description="Monitor coffee stock, movements and controlled stock adjustments."
      links={inventoryLinks}
    />
  );
}
