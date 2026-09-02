import FinanceManagerOnly from "@/components/auth/finance-manager-only";
import AgentWalletManagement from "@/components/agent-wallets/agent-wallet-management";

export default function AgentWalletsPage() {
  return (
    <FinanceManagerOnly>
      <AgentWalletManagement />
    </FinanceManagerOnly>
  );
}
