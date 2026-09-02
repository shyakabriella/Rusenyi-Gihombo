import FinanceManagerOnly from "@/components/auth/finance-manager-only";
import ProcessingYieldManagement from "@/components/processing-yields/processing-yield-management";

export default function ProcessingYieldsPage() {
  return (
    <FinanceManagerOnly>
      <ProcessingYieldManagement />
    </FinanceManagerOnly>
  );
}
