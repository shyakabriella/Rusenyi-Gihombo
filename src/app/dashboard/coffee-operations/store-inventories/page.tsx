import FinanceManagerOnly from "@/components/auth/finance-manager-only";
import StoreInventoryManagement from "@/components/store-inventories/store-inventory-management";

export default function StoreInventoriesPage() {
  return (
    <FinanceManagerOnly>
      <StoreInventoryManagement />
    </FinanceManagerOnly>
  );
}
