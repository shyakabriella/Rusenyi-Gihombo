import { redirect } from "next/navigation";

export default function StoreInventoriesRedirect() {
  redirect(
    "/dashboard/coffee-operations/store-inventories",
  );
}
