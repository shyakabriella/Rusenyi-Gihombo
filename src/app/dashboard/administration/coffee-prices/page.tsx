import AdminOnly from "@/components/auth/admin-only";

import CoffeePriceManagement from "@/components/coffee-prices/coffee-price-management";

export default function CoffeePricesPage() {
  return (
    <AdminOnly>
      <CoffeePriceManagement />
    </AdminOnly>
  );
}
