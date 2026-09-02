import AdminOnly from "@/components/auth/admin-only";

import FarmerManagement from "@/components/farmers/farmer-management";

export default function FarmersPage() {
  return (
    <AdminOnly>
      <FarmerManagement />
    </AdminOnly>
  );
}
