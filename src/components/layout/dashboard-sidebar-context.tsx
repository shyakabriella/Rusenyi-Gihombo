"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";

type DashboardSidebarContextType = {
  mobileOpen: boolean;
  desktopCollapsed: boolean;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleMobileSidebar: () => void;
  toggleDesktopSidebar: () => void;
};

const DashboardSidebarContext =
  createContext<DashboardSidebarContextType | null>(
    null,
  );

export function DashboardSidebarProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [
    desktopCollapsed,
    setDesktopCollapsed,
  ] = useState(false);

  function openMobileSidebar() {
    setMobileOpen(true);
  }

  function closeMobileSidebar() {
    setMobileOpen(false);
  }

  function toggleMobileSidebar() {
    setMobileOpen((value) => !value);
  }

  function toggleDesktopSidebar() {
    setDesktopCollapsed(
      (value) => !value,
    );
  }

  return (
    <DashboardSidebarContext.Provider
      value={{
        mobileOpen,
        desktopCollapsed,
        openMobileSidebar,
        closeMobileSidebar,
        toggleMobileSidebar,
        toggleDesktopSidebar,
      }}
    >
      {children}
    </DashboardSidebarContext.Provider>
  );
}

export function useDashboardSidebar() {
  const context = useContext(
    DashboardSidebarContext,
  );

  if (!context) {
    throw new Error(
      "useDashboardSidebar must be used inside DashboardSidebarProvider",
    );
  }

  return context;
}
