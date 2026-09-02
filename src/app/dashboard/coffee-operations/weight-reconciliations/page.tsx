import FinanceManagerOnly from "@/components/auth/finance-manager-only";
import WeightReconciliationManagement from "@/components/weight-reconciliations/weight-reconciliation-management";

export default function WeightReconciliationsPage() {
  return (
    <FinanceManagerOnly>
      <WeightReconciliationManagement />
    </FinanceManagerOnly>
  );
}
