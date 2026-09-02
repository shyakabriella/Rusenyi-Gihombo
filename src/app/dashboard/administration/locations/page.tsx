import AdminOnly from "@/components/auth/admin-only";
import LocationManagement from "@/components/locations/location-management";

export default function LocationsPage() {
  return (
    <AdminOnly>
      <div className="flex h-full min-h-0 flex-col">
<main className="min-h-0 flex-1 overflow-y-auto bg-[#faf9f7] p-4 sm:p-5 lg:p-6">
          <LocationManagement />
        </main>
</div>
    </AdminOnly>
  );
}
