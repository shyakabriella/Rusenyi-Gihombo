import { redirect } from "next/navigation";

export default function FarmerDeliveriesRedirect() {
  redirect(
    "/dashboard/coffee-operations/direct-farmer-deliveries",
  );
}
