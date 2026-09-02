"use client";

import type { ReactNode } from "react";

import {
  useCurrentUser,
} from "@/components/auth/current-user-context";

export default function FinanceManagerOnly({
  children,
}: {
  children: ReactNode;
}) {
  const {
    user,
    loading,
  } = useCurrentUser();

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm font-semibold text-slate-600">
          Loading...
        </p>
      </div>
    );
  }

  const allowed =
    user?.role === "admin" ||
    user?.role === "accountant";

  if (!allowed) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-bold text-red-900">
          Access Denied
        </h2>

        <p className="mt-2 text-sm text-red-700">
          Only Admin and Accountant can manage cash allocations.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
