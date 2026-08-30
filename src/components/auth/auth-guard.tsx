"use client";

import {
  ReactNode,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import { getToken } from "@/lib/auth-storage";
import { getCurrentUser } from "@/services/auth-service";

type AuthGuardProps = {
  children: ReactNode;
};

export default function AuthGuard({
  children,
}: AuthGuardProps) {
  const router = useRouter();

  const [ready, setReady] =
    useState(false);

  useEffect(() => {
    let active = true;

    async function verifyUser() {
      const token = getToken();

      if (!token) {
        router.replace("/");
        return;
      }

      try {
        const user = await getCurrentUser();

        if (!active) {
          return;
        }

        if (user.must_change_password === true) {
          router.replace("/change-password");
          return;
        }

        setReady(true);
      } catch {
        if (active) {
          router.replace("/");
        }
      }
    }

    verifyUser();

    return () => {
      active = false;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7f9]">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <LoaderCircle
            size={20}
            className="animate-spin"
          />

          Loading...
        </div>
      </div>
    );
  }

  return children;
}
