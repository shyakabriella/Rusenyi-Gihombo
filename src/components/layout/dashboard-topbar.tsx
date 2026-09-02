"use client";

import {
  ChevronDown,
  LogOut,
  Menu,
  Search,
} from "lucide-react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import {
  getUserInitials,
  roleLabels,
  useCurrentUser,
} from "@/components/auth/current-user-context";

import {
  useDashboardSidebar,
} from "@/components/layout/dashboard-sidebar-context";

import NotificationBell from "@/components/notifications/notification-bell";

import {
  logout,
} from "@/services/auth-service";

function getPageTitle(
  pathname: string,
): string {
  if (
    pathname === "/dashboard"
  ) {
    return "Dashboard";
  }

  if (
    pathname.startsWith(
      "/dashboard/administration/coffee-prices",
    )
  ) {
    return "Coffee Price Management";
  }

  if (
    pathname.startsWith(
      "/dashboard/administration/coffee-seasons",
    )
  ) {
    return "Coffee Season";
  }

  if (
    pathname.startsWith(
      "/dashboard/administration/locations",
    )
  ) {
    return "Location Management";
  }

  if (
    pathname.startsWith(
      "/dashboard/administration",
    )
  ) {
    return "Settings";
  }

  if (
    pathname.startsWith(
      "/dashboard/coffee-operations/coffee-purchases",
    )
  ) {
    return "Coffee Purchases";
  }

  if (
    pathname.startsWith(
      "/dashboard/coffee-operations/direct-farmer-deliveries",
    )
  ) {
    return "Direct Farmer Deliveries";
  }

  if (
    pathname.startsWith(
      "/dashboard/coffee-operations/agent-collections",
    )
  ) {
    return "Agent Collections";
  }

  if (
    pathname.startsWith(
      "/dashboard/coffee-operations/field-weighings",
    )
  ) {
    return "Field Weighing";
  }

  if (
    pathname.startsWith(
      "/dashboard/coffee-operations/factory-receptions",
    )
  ) {
    return "Factory Reception";
  }

  if (
    pathname.startsWith(
      "/dashboard/coffee-operations/coffee-lots",
    )
  ) {
    return "Coffee Lots / Batches";
  }

  if (
    pathname.startsWith(
      "/dashboard/coffee-operations",
    )
  ) {
    return "Coffee Operations";
  }

  if (
    pathname.startsWith(
      "/dashboard/people/agents",
    )
  ) {
    return "Agents Management";
  }

  if (
    pathname.startsWith(
      "/dashboard/people/farmers",
    )
  ) {
    return "Farmers Management";
  }

  if (
    pathname.startsWith(
      "/dashboard/people/drivers",
    )
  ) {
    return "Drivers";
  }

  if (
    pathname.startsWith(
      "/dashboard/people/workers",
    )
  ) {
    return "Workers";
  }

  if (
    pathname.startsWith(
      "/dashboard/people",
    )
  ) {
    return "People";
  }

  if (
    pathname.startsWith(
      "/dashboard/finance/cash-allocations",
    )
  ) {
    return "Cash Allocations";
  }

  if (
    pathname.startsWith(
      "/dashboard/finance/agent-wallets",
    )
  ) {
    return "Agent Cash Wallets";
  }

  if (
    pathname.startsWith(
      "/dashboard/finance",
    )
  ) {
    return "Finance";
  }

  if (
    pathname.startsWith(
      "/dashboard/logistics",
    )
  ) {
    return "Logistics";
  }

  if (
    pathname.startsWith(
      "/dashboard/store-processing",
    )
  ) {
    return "Store & Processing";
  }

  if (
    pathname.startsWith(
      "/dashboard/approvals",
    )
  ) {
    return "Approvals";
  }


  if (
    pathname.startsWith(
      "/dashboard/notifications",
    )
  ) {
    return "Notifications";
  }

  if (
    pathname.startsWith(
      "/dashboard/audit-trail",
    )
  ) {
    return "Audit Trail";
  }

  if (
    pathname.startsWith(
      "/dashboard/reports",
    )
  ) {
    return "Reports";
  }

  if (
    pathname.startsWith(
      "/dashboard/users",
    )
  ) {
    return "User Management";
  }

  return "Dashboard";
}

export default function DashboardTopbar() {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const {
    openMobileSidebar,
  } = useDashboardSidebar();

  const {
    user,
    loading,
    clearUser,
  } = useCurrentUser();

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  const userName =
    user?.name ??
    (loading
      ? "Loading..."
      : "Unknown User");

  const userRole =
    user?.role
      ? roleLabels[user.role]
      : "";

  const initials =
    getUserInitials(
      user?.name,
    );

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await logout();
    } catch {
      // Clear the local session anyway.
    } finally {
      clearUser();

      router.replace(
        "/login",
      );

      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-30 h-[80px] border-b border-[#e8dfd2] bg-white">
      <div className="flex h-full items-center gap-4 px-4 sm:px-6 lg:px-7">
        {/* MOBILE MENU */}
        <button
          type="button"
          onClick={
            openMobileSidebar
          }
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#e8dfd2] text-slate-700 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        {/* TITLE */}
        <h1 className="shrink-0 font-serif text-2xl font-bold text-slate-950 sm:text-[28px]">
          {getPageTitle(
            pathname,
          )}
        </h1>

        {/* SEARCH */}
        <div className="mx-auto hidden w-full max-w-[455px] lg:block">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8097b3]"
            />

            <input
              type="search"
              placeholder="Search..."
              className="h-[50px] w-full rounded-2xl border border-[#e8dfd2] bg-[#fdfcf9] pl-12 pr-4 text-sm font-medium text-slate-900 outline-none placeholder:text-[#8097b3] focus:border-[#c4ab80]"
            />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="ml-auto flex items-center gap-4">
          <NotificationBell />

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setProfileOpen(
                  (value) =>
                    !value,
                )
              }
              className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-[#faf5ed]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2e5cf] text-sm font-bold text-[#075b38]">
                {initials}
              </div>

              <div className="hidden text-left sm:block">
                <p className="max-w-[150px] truncate text-sm font-bold text-slate-950">
                  {userName}
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  {userRole}
                </p>
              </div>

              <ChevronDown
                size={17}
                className="hidden text-[#54708c] sm:block"
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-[56px] z-50 w-52 rounded-xl border border-[#e5dace] bg-white p-2 shadow-xl">
                <div className="border-b border-slate-100 px-3 py-2">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {userName}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {userRole}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={
                    loggingOut
                  }
                  onClick={() =>
                    void handleLogout()
                  }
                  className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                >
                  <LogOut
                    size={17}
                  />

                  {loggingOut
                    ? "Signing out..."
                    : "Sign out"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
