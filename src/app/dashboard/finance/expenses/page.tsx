import FinanceManagerOnly from "@/components/auth/finance-manager-only";
import ExpenseManagement from "@/components/expenses/expense-management";

export default function ExpensesPage() {
  return (
    <FinanceManagerOnly>
      <ExpenseManagement />
    </FinanceManagerOnly>
  );
}
