import FinanceManagerOnly from "@/components/auth/finance-manager-only";
import PettyCashManagement from "@/components/petty-cash/petty-cash-management";

export default function PettyCashPage() {
  return (
    <FinanceManagerOnly>
      <PettyCashManagement />
    </FinanceManagerOnly>
  );
}
