import {
  redirect,
} from "next/navigation";

export default function AgentsRedirectPage() {
  redirect(
    "/dashboard/people/agents"
  );
}
