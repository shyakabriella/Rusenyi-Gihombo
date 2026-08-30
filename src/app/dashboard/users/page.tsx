import AdminOnly from "@/components/auth/admin-only";
import DashboardFooter from "@/components/layout/dashboard-footer";
import DashboardTopbar from "@/components/layout/dashboard-topbar";
import UsersManagement from "@/components/users/users-management";

export default function UsersPage() {
  return (
    <AdminOnly>
      <div className="flex h-full min-h-0 flex-col">
        <DashboardTopbar title="User Management" />

        <main className="min-h-0 flex-1 overflow-y-auto bg-[#faf9f7] p-4 sm:p-5 lg:p-6">
          <UsersManagement />
        </main>

        <DashboardFooter />
      </div>
    </AdminOnly>
  );
}
