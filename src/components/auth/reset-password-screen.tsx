"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";
import {
  FormEvent,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:8000/api";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token =
    searchParams.get("token") ?? "";

  const email =
    searchParams.get("email") ?? "";

  const [password, setPassword] =
    useState("");

  const [
    passwordConfirmation,
    setPasswordConfirmation,
  ] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setSuccess("");

    if (!token || !email) {
      setError(
        "This password reset link is invalid."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (
      password !== passwordConfirmation
    ) {
      setError(
        "Password confirmation does not match."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/reset-password`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            token,
            email,
            password,
            password_confirmation:
              passwordConfirmation,
          }),
        },
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ??
            "Unable to reset password."
        );
      }

      setSuccess(
        result?.message ??
          "Password reset successfully."
      );

      window.setTimeout(() => {
        router.replace("/login");
      }, 1200);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4ecdf] p-4">
      <div className="grid w-full max-w-[980px] overflow-hidden rounded-2xl border border-[#e4d8c6] bg-white shadow-[0_18px_45px_rgba(40,30,20,0.15)] lg:grid-cols-[42%_58%]">
        <section className="relative hidden min-h-[560px] overflow-hidden bg-[#08442f] lg:flex">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a5038] to-[#063324]" />

          <div className="relative z-10 flex w-full flex-col items-center justify-center px-10 text-center">
            <Image
              src="/logo.png"
              alt="Rusenyi High Lands"
              width={140}
              height={140}
              priority
              className="h-[140px] w-[140px] object-contain"
            />

            <h1 className="mt-6 font-serif text-3xl font-semibold text-[#fff4dc]">
              New Password
            </h1>

            <div className="my-4 h-px w-32 bg-[#d9ad59]" />

            <p className="text-sm leading-6 text-[#f8ecd5]">
              Create a secure new password
              for your account.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-[410px]">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f5e5c5] text-[#075038]">
                <LockKeyhole size={24} />
              </div>

              <h2 className="mt-4 font-serif text-[31px] font-semibold text-[#2f1d11]">
                Reset Password
              </h2>

              <p className="mt-3 text-sm text-slate-600">
                {email || "Account"}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-4"
            >
              {error && (
                <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle
                    size={18}
                    className="shrink-0"
                  />

                  {error}
                </div>
              )}

              {success && (
                <div className="flex gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  <CheckCircle2
                    size={18}
                    className="shrink-0"
                  />

                  {success}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  New Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0b533a]"
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter new password"
                    className="h-12 w-full rounded-lg border border-[#d5b36f] bg-white pl-11 pr-11 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-[#0b533a] focus:ring-2 focus:ring-[#0b533a]/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0b533a]"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Confirm New Password
                </label>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    passwordConfirmation
                  }
                  onChange={(event) =>
                    setPasswordConfirmation(
                      event.target.value
                    )
                  }
                  placeholder="Confirm new password"
                  className="h-12 w-full rounded-lg border border-[#d5b36f] bg-white px-4 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-[#0b533a] focus:ring-2 focus:ring-[#0b533a]/10"
                />
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  Boolean(success)
                }
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#0a5038] font-semibold text-white transition hover:bg-[#073e2c] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                    Resetting...
                  </>
                ) : (
                  <>
                    <LockKeyhole size={18} />
                    Reset Password
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm font-semibold text-[#0b533a] hover:underline"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
