import { redirect } from "next/navigation";

export default function AgentCollectionsRedirect() {
  redirect(
    "/dashboard/coffee-operations/agent-collections",
  );
}
