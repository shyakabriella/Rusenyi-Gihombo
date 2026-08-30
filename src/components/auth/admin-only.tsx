"use client";

import Link from "next/link";
import {
  LoaderCircle,
  ShieldAlert,
} from "lucide-react";
import {
  ReactNode,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";

import {
  useCurrentUser,
} from "@/components/auth/current-user-context";

export default function AdminOnly({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  const {
    user,
    loading,
  } = useCurrentUser();

  useEffect(() => {
    if (
      !loading &&
      !user
    ) {
      router.replace("/login");
    }
  }, [
    loading,
    router,
    user,
  ]);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <LoaderCircle
            size={28}
            className="mx-auto animate-spin text-[#0a5038]"
          />

          <p className="mt-3 text-sm text-slate-500">
            Checking permissions...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user.role !== "admin") {
    return (
      <div className="flex min-h-[460px] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <ShieldAlert size={27} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Access Denied
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            User Management is available
            only to administrators.
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-[#0a5038] px-5 text-sm font-semibold text-white transition hover:bg-[#073e2c]"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
