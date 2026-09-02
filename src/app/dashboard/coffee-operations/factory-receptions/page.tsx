import FinanceManagerOnly from "@/components/auth/finance-manager-only";
import FactoryReceptionManagement from "@/components/factory-receptions/factory-reception-management";

export default function FactoryReceptionsPage() {
  return (
    <FinanceManagerOnly>
      <FactoryReceptionManagement />
    </FinanceManagerOnly>
  );
}
