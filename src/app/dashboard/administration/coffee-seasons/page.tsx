import AdminOnly from "@/components/auth/admin-only";
import CoffeeSeasonManagement from "@/components/coffee-seasons/coffee-season-management";
export default function CoffeeSeasonsPage() {
  return (
    <AdminOnly>
      <div className="flex h-full min-h-0 flex-col">
<main className="min-h-0 flex-1 overflow-y-auto bg-[#faf9f7] p-4 sm:p-5 lg:p-6">
          <CoffeeSeasonManagement />
        </main>
</div>
    </AdminOnly>
  );
}
