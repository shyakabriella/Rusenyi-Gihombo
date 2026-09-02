import { redirect } from "next/navigation";

export default function CoffeePurchasesRedirect() {
  redirect("/dashboard/coffee-operations/coffee-purchases");
}
