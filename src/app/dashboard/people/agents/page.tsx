import AdminOnly from "@/components/auth/admin-only";

import AgentManagement from "@/components/agents/agent-management";

export default function AgentsPage() {
  return (
    <AdminOnly>
      <AgentManagement />
    </AdminOnly>
  );
}
