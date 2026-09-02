import FinanceManagerOnly from "@/components/auth/finance-manager-only";
import PayrollManagement from "@/components/payroll/payroll-management";

export default function PayrollPage() {
  return (
    <FinanceManagerOnly>
      <PayrollManagement />
    </FinanceManagerOnly>
  );
}
