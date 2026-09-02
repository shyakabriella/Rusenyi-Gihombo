import FinanceManagerOnly from "@/components/auth/finance-manager-only";
import CoffeePurchaseManagement from "@/components/coffee-purchases/coffee-purchase-management";

export default function CoffeePurchasesPage() {
  return (
    <FinanceManagerOnly>
      <CoffeePurchaseManagement />
    </FinanceManagerOnly>
  );
}
