import FinanceManagerOnly from "@/components/auth/finance-manager-only";
import DirectFarmerDeliveryManagement from "@/components/direct-farmer-deliveries/direct-farmer-delivery-management";

export default function DirectFarmerDeliveriesPage() {
  return (
    <FinanceManagerOnly>
      <DirectFarmerDeliveryManagement />
    </FinanceManagerOnly>
  );
}
