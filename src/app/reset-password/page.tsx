import { Suspense } from "react";

import ResetPasswordScreen from "@/components/auth/reset-password-screen";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f4ecdf]">
          <p className="text-sm text-slate-600">
            Loading password reset...
          </p>
        </main>
      }
    >
      <ResetPasswordScreen />
    </Suspense>
  );
}
