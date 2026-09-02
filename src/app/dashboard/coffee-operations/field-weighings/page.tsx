import FinanceManagerOnly from "@/components/auth/finance-manager-only";
import FieldWeighingManagement from "@/components/field-weighings/field-weighing-management";

export default function FieldWeighingsPage() {
  return (
    <FinanceManagerOnly>
      <FieldWeighingManagement />
    </FinanceManagerOnly>
  );
}
