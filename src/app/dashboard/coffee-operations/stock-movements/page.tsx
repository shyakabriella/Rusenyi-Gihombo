import FinanceManagerOnly from "@/components/auth/finance-manager-only";
import StockMovementManagement from "@/components/stock-movements/stock-movement-management";

export default function StockMovementsPage() {
  return (
    <FinanceManagerOnly>
      <StockMovementManagement />
    </FinanceManagerOnly>
  );
}
