import FinanceManagerOnly from "@/components/auth/finance-manager-only";

import CashAllocationManagement from "@/components/cash-allocations/cash-allocation-management";

export default function CashAllocationsPage() {
  return (
    <FinanceManagerOnly>
      <CashAllocationManagement />
    </FinanceManagerOnly>
  );
}
