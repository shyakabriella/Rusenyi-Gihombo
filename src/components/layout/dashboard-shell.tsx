"use client";

import type {
  ReactNode,
} from "react";

import DashboardFooter from "@/components/layout/dashboard-footer";
import DashboardSidebar from "@/components/layout/dashboard-sidebar";
import DashboardTopbar from "@/components/layout/dashboard-topbar";

import {
  useDashboardSidebar,
} from "@/components/layout/dashboard-sidebar-context";

export default function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const {
    desktopCollapsed,
  } = useDashboardSidebar();

  return (
    <div className="min-h-dvh bg-[#fbfaf7]">
      <DashboardSidebar />

      <div
        className={[
          "flex min-h-dvh w-full min-w-0 flex-col",
          "transition-[margin-left,width] duration-300 ease-in-out",

          desktopCollapsed
            ? "lg:ml-[88px] lg:w-[calc(100%_-_88px)]"
            : "lg:ml-[290px] lg:w-[calc(100%_-_290px)]",
        ].join(" ")}
      >
        <DashboardTopbar />

        <main className="min-w-0 flex-1 overflow-x-hidden bg-[#fbfaf7] px-4 py-5 sm:px-5 lg:px-7">
          {children}
        </main>

        <DashboardFooter />
      </div>
    </div>
  );
}
