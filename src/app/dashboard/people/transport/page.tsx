import FinanceManagerOnly from "@/components/auth/finance-manager-only";
import TransportManagement from "@/components/transport/transport-management";

export default function TransportPage() {
  return (
    <FinanceManagerOnly>
      <TransportManagement />
    </FinanceManagerOnly>
  );
}
