import FinanceManagerOnly from "@/components/auth/finance-manager-only";
import CollectionTripManagement from "@/components/collection-trips/collection-trip-management";

export default function CollectionTripsPage() {
  return (
    <FinanceManagerOnly>
      <CollectionTripManagement />
    </FinanceManagerOnly>
  );
}
