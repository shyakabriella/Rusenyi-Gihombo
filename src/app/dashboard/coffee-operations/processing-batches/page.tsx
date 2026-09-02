import FinanceManagerOnly from "@/components/auth/finance-manager-only";
import ProcessingBatchManagement from "@/components/processing-batches/processing-batch-management";

export default function ProcessingBatchesPage() {
  return (
    <FinanceManagerOnly>
      <ProcessingBatchManagement />
    </FinanceManagerOnly>
  );
}
