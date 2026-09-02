"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ChartNoAxesColumnIncreasing,
  ChevronLeft,
  CircleDollarSign,
  Coffee,
  FileCheck2,
  LayoutDashboard,
  Settings,
  Store,
  Truck,
  UserCog,
  Users,
  X,
} from "lucide-react";

import {
  getUserInitials,
  roleLabels,
  useCurrentUser,
} from "@/components/auth/current-user-context";

import {
  useDashboardSidebar,
} from "@/components/layout/dashboard-sidebar-context";

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Coffee Operations",
    href: "/dashboard/coffee-operations",
    icon: Coffee,
  },
  {
    label: "People",
    href: "/dashboard/people",
    icon: Users,
  },
  {
    label: "Finance",
    href: "/dashboard/finance",
    icon: CircleDollarSign,
  },
  {
    label: "Logistics",
    href: "/dashboard/logistics",
    icon: Truck,
  },
  {
    label: "Store & Processing",
    href: "/dashboard/store-processing",
    icon: Store,
  },
  {
    label: "Approvals",
    href: "/dashboard/approvals",
    icon: FileCheck2,
    badge: "6",
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: ChartNoAxesColumnIncreasing,
  },
  {
    label: "Audit Trail",
    href: "/dashboard/audit-trail",
    icon: Settings,
  },

  {
    label: "User Management",
    href: "/dashboard/users",
    icon: UserCog,
  },
  {
    label: "Settings",
    href: "/dashboard/administration",
    icon: Settings,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  const {
    user,
    loading,
  } = useCurrentUser();

  const {
    mobileOpen,
    desktopCollapsed,
    closeMobileSidebar,
    toggleDesktopSidebar,
  } = useDashboardSidebar();

  function isActive(
    href: string,
  ) {
    if (
      href === "/dashboard"
    ) {
      return pathname ===
        "/dashboard";
    }

    return pathname.startsWith(
      href,
    );
  }

  const accountantAllowedRoutes = [
    "/dashboard",
    "/dashboard/coffee-operations",
    "/dashboard/finance",
    "/dashboard/reports",
  ];

  const visibleMenuItems =
    menuItems.filter(
      (item) => {
        if (loading) {
          return false;
        }

        if (
          user?.role === "admin"
        ) {
          return true;
        }

        if (
          user?.role ===
          "accountant"
        ) {
          return accountantAllowedRoutes.includes(
            item.href,
          );
        }

        return false;
      },
    );

  const userName =
    user?.name ??
    (loading
      ? "Loading..."
      : "Unknown User");

  const userRole =
    user?.role
      ? roleLabels[user.role]
      : loading
        ? "Loading..."
        : "Unknown Role";

  const initials =
    getUserInitials(
      user?.name,
    );

  return (
    <>
      {/* Mobile backdrop */}
      <button
        type="button"
        aria-label="Close sidebar"
        onClick={
          closeMobileSidebar
        }
        className={[
          "fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px]",
          "transition-all duration-300 lg:hidden",

          mobileOpen
            ? "visible opacity-100"
            : "invisible opacity-0",
        ].join(" ")}
      />

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50",
          "flex h-dvh flex-col",
          "border-r border-[#e8dfd2]",
          "bg-[#fffdf9]",
          "transition-[width,transform] duration-300 ease-in-out",

          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",

          desktopCollapsed
            ? "w-[290px] lg:w-[88px]"
            : "w-[290px]",
        ].join(" ")}
      >
        {/* Mobile close */}
        <button
          type="button"
          onClick={
            closeMobileSidebar
          }
          aria-label="Close sidebar"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-[#f8ecda] lg:hidden"
        >
          <X size={18} />
        </button>

        {/* Desktop collapse */}
        <button
          type="button"
          onClick={
            toggleDesktopSidebar
          }
          aria-label={
            desktopCollapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          className="
            absolute
            -right-[17px]
            top-[112px]
            z-[60]
            hidden
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            border
            border-[#e6d7c4]
            bg-white
            text-[#936316]
            shadow-sm
            transition
            hover:bg-[#fbf4e9]
            lg:flex
          "
        >
          <ChevronLeft
            size={17}
            className={[
              "transition-transform duration-300",

              desktopCollapsed
                ? "rotate-180"
                : "",
            ].join(" ")}
          />
        </button>

        {/* Brand */}
        <div
          className={[
            "shrink-0 border-b border-[#eee5d8]",

            desktopCollapsed
              ? "px-2 pb-3 pt-4"
              : "px-4 pb-4 pt-4",

            "[@media(max-height:760px)]:pb-2",
            "[@media(max-height:760px)]:pt-2",
          ].join(" ")}
        >
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="Rusenyi High Lands Speciality Coffee Limited"
              width={90}
              height={90}
              priority
              className={[
                "object-contain transition-all duration-300",

                desktopCollapsed
                  ? "h-11 w-11"
                  : "h-[72px] w-[72px]",

                "[@media(max-height:760px)]:h-[58px]",
                "[@media(max-height:760px)]:w-[58px]",
              ].join(" ")}
            />
          </div>

          {!desktopCollapsed && (
            <div className="mt-2 text-center">
              <p className="font-serif text-[12px] font-bold leading-[17px] text-[#151515]">
                RUSENYI HIGH LANDS
                <br />
                SPECIALITY COFFEE LIMITED
              </p>

              <div className="mx-auto mt-3 h-px w-28 bg-[#d3aa63]" />
            </div>
          )}
        </div>

        {/* Navigation - fixed, no scrollbar */}
        <nav
          className={[
            "flex min-h-0 flex-1 flex-col justify-start",
            "overflow-hidden",

            desktopCollapsed
              ? "px-2 py-3"
              : "px-3 py-3",

            "[@media(max-height:760px)]:py-2",
          ].join(" ")}
        >
          <div
            className="
              flex
              flex-col
              gap-1
              [@media(max-height:760px)]:gap-[2px]
            "
          >
            {visibleMenuItems.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  isActive(
                    item.href,
                  );

                return (
                  <Link
                    key={
                      item.href
                    }
                    href={
                      item.href
                    }
                    title={
                      desktopCollapsed
                        ? item.label
                        : undefined
                    }
                    onClick={
                      closeMobileSidebar
                    }
                    className={[
                      "relative flex shrink-0 items-center rounded-xl",
                      "h-10 transition-all duration-200",
                      "[@media(max-height:760px)]:h-9",

                      desktopCollapsed
                        ? "justify-center px-2"
                        : "gap-3 px-3",

                      active
                        ? "bg-[#f4e4c9] font-bold text-[#714b12]"
                        : "font-medium text-[#243b55] hover:bg-[#faf4ea]",
                    ].join(" ")}
                  >
                    {active && (
                      <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-full bg-[#d28b13]" />
                    )}

                    <Icon
                      size={19}
                      strokeWidth={
                        active
                          ? 2.1
                          : 1.8
                      }
                      className="shrink-0"
                    />

                    {!desktopCollapsed && (
                      <>
                        <span className="min-w-0 flex-1 truncate text-[14px]">
                          {
                            item.label
                          }
                        </span>

                        {item.badge && (
                          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#db9118] px-1.5 text-[11px] font-bold text-white">
                            {
                              item.badge
                            }
                          </span>
                        )}
                      </>
                    )}

                    {desktopCollapsed &&
                      item.badge && (
                        <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-[#db9118]" />
                      )}
                  </Link>
                );
              },
            )}
          </div>
        </nav>

        {/* User fixed at bottom */}
        <div
          className={[
            "shrink-0 border-t border-[#eee5d8]",

            desktopCollapsed
              ? "p-2"
              : "px-3 py-3",

            "[@media(max-height:760px)]:py-2",
          ].join(" ")}
        >
          <div
            className={[
              "flex items-center rounded-xl border border-[#e4dacd] bg-white",

              desktopCollapsed
                ? "justify-center p-1.5"
                : "gap-3 px-3 py-2",
            ].join(" ")}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#272727] text-sm font-semibold text-white">
              {initials}
            </div>

            {!desktopCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold text-slate-950">
                  {userName}
                </p>

                <p className="mt-0.5 truncate text-[11px] text-slate-500">
                  {userRole}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
