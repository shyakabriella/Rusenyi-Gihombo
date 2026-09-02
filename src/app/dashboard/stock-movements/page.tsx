import { redirect } from "next/navigation";

export default function StockMovementsRedirect() {
  redirect(
    "/dashboard/coffee-operations/stock-movements",
  );
}
