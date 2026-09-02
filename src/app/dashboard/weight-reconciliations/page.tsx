import { redirect } from "next/navigation";

export default function WeightReconciliationRedirect() {
  redirect(
    "/dashboard/coffee-operations/weight-reconciliations",
  );
}
