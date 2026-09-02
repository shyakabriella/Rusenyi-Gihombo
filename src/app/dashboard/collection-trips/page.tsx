import { redirect } from "next/navigation";

export default function CollectionTripsRedirect() {
  redirect(
    "/dashboard/coffee-operations/collection-trips",
  );
}
