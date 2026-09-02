import FinanceManagerOnly from "@/components/auth/finance-manager-only";
import AgentCollectionManagement from "@/components/agent-collections/agent-collection-management";

export default function AgentCollectionsPage() {
  return (
    <FinanceManagerOnly>
      <AgentCollectionManagement />
    </FinanceManagerOnly>
  );
}
