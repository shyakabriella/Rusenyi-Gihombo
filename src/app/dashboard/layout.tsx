import AuthGuard from "@/components/auth/auth-guard";

import {
  CurrentUserProvider,
} from "@/components/auth/current-user-context";

import DashboardShell from "@/components/layout/dashboard-shell";

import {
  DashboardSidebarProvider,
} from "@/components/layout/dashboard-sidebar-context";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <CurrentUserProvider>
        <DashboardSidebarProvider>
          <DashboardShell>
            {children}
          </DashboardShell>
        </DashboardSidebarProvider>
      </CurrentUserProvider>
    </AuthGuard>
  );
}
