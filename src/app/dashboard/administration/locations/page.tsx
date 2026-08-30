import AdminOnly from "@/components/auth/admin-only";
import DashboardFooter from "@/components/layout/dashboard-footer";
import DashboardTopbar from "@/components/layout/dashboard-topbar";
import LocationManagement from "@/components/locations/location-management";

export default function LocationsPage() {
  return (
    <AdminOnly>
      <div className="flex h-full min-h-0 flex-col">
        <DashboardTopbar title="Location Management" />

        <main className="min-h-0 flex-1 overflow-y-auto bg-[#faf9f7] p-4 sm:p-5 lg:p-6">
          <LocationManagement />
        </main>

        <DashboardFooter />
      </div>
    </AdminOnly>
  );
}
