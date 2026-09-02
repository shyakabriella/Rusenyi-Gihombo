import FinanceManagerOnly from "@/components/auth/finance-manager-only";
import ApprovalManagement from "@/components/approvals/approval-management";

export default function ApprovalsPage() {
  return (
    <FinanceManagerOnly>
      <ApprovalManagement />
    </FinanceManagerOnly>
  );
}
