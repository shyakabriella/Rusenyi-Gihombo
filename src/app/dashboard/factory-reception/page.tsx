import { redirect } from "next/navigation";

export default function FactoryReceptionRedirect() {
  redirect(
    "/dashboard/coffee-operations/factory-receptions",
  );
}
