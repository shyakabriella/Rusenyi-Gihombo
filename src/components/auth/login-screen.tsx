"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useState,
} from "react";

import {
  AlertCircle,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  Mail,
  UserRound,
} from "lucide-react";

import { ApiError } from "@/lib/api";
import {
  login,
  logout,
} from "@/services/auth-service";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");

    if (!email.trim()) {
      setError("Enter your email or username.");
      return;
    }

    if (!password) {
      setError("Enter your password.");
      return;
    }

    setLoading(true);

    try {
      const result = await login({
        email: email.trim(),
        password,
      });

      const user = result.user;

      if (!user) {
        throw new Error(
          "Login succeeded but user information was not returned.",
        );
      }

      /*
       * Gihombo platform access:
       *
       * Web:
       * - Admin
       * - Accountant
       *
       * Mobile:
       * - Balance Officer
       * - Agent
       * - Driver
       * - Store Officer
       */
      const role = user.role ?? "";

      const mobileRoleMessages: Record<
        string,
        string
      > = {
        balance:
          "Balance Officer accounts use the Gihombo mobile application.",
        agent:
          "Agent accounts use the Gihombo mobile application.",
        driver:
          "Driver accounts use the Gihombo mobile application.",
        store:
          "Store Officer accounts use the Gihombo mobile application.",
      };

      const mobileRoleMessage =
        mobileRoleMessages[role];

      if (mobileRoleMessage) {
        /*
         * login() already created/stored an authenticated
         * session, so remove it before blocking Web access.
         */
        try {
          await logout();
        } catch {
          // We still block Web access even if logout request fails.
        }

        setError(
          mobileRoleMessage,
        );

        return;
      }

      /*
       * Reject missing or unknown roles instead of
       * allowing them into the dashboard accidentally.
       */
      if (
        role !== "admin" &&
        role !== "accountant"
      ) {
        try {
          await logout();
        } catch {
          // Keep Web access blocked.
        }

        setError(
          "Your account role is not authorized to use the Web Dashboard.",
        );

        return;
      }

      /*
       * Temporary-password check applies to
       * authorized Web users.
       */
      if (
        user.must_change_password === true
      ) {
        router.replace(
          "/change-password",
        );

        return;
      }

      /*
       * Both Admin and Accountant currently enter
       * the Web Dashboard.
       *
       * Their visible modules and permissions will
       * be controlled by their authenticated role.
       */
      switch (role) {
        case "admin":
          router.replace("/dashboard");
          return;

        case "accountant":
          router.replace("/dashboard");
          return;

        default:
          return;
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unable to sign in.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4ecdf] p-4">
      <div className="grid w-full max-w-[1080px] overflow-hidden rounded-2xl border border-[#e4d8c6] bg-white shadow-[0_18px_45px_rgba(40,30,20,0.15)] lg:h-[620px] lg:grid-cols-[44%_56%]">

        {/* Branding */}
        <section className="relative hidden overflow-hidden bg-[#08442f] lg:flex">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a5038] to-[#063324]" />

          <div className="absolute -right-14 top-0 h-full w-20 rotate-[4deg] bg-[#d5aa56]" />

          <div className="absolute -right-10 top-0 h-full w-16 rotate-[4deg] bg-[#f4ecdf]" />

          <div className="relative z-10 flex w-full flex-col items-center justify-center px-10 text-center">
            <Image
              src="/logo.png"
              alt="Gihombo Coffee Washing Station"
              width={155}
              height={155}
              priority
              className="h-[150px] w-[150px] object-contain"
            />

            <h1 className="mt-6 font-serif text-[38px] font-semibold text-[#fff4dc]">
              Welcome Back
            </h1>

            <div className="my-4 flex items-center gap-3">
              <span className="h-px w-16 bg-[#d9ad59]" />

              <span className="h-2 w-2 rounded-full border border-[#e4c176]" />

              <span className="h-px w-16 bg-[#d9ad59]" />
            </div>

            <p className="font-serif text-xl leading-8 text-[#f8ecd5]">
              Coffee Washing Station
              <br />
              Management System
            </p>
          </div>
        </section>

        {/* Login form */}
        <section className="flex items-center justify-center px-6 py-8 sm:px-10 lg:px-14">
          <div className="w-full max-w-[410px]">

            <div className="mb-5 flex justify-center lg:hidden">
              <Image
                src="/logo.png"
                alt="Gihombo Coffee Washing Station"
                width={95}
                height={95}
                priority
                className="h-[95px] w-[95px] object-contain"
              />
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#f5e5c5] text-[#075038]">
                <UserRound
                  size={23}
                  strokeWidth={1.7}
                />
              </div>

              <h2 className="mt-3 font-serif text-[35px] font-semibold text-[#2f1d11]">
                Sign in
              </h2>

              <div className="mx-auto mt-3 h-[2px] w-9 bg-[#d3a348]" />

              <p className="mt-3 text-sm text-slate-500">
                Enter your account details to continue
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-4"
            >
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
                >
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{error}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0b533a]"
                  />

                  <input
                    id="email"
                    name="email"
                    type="text"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    disabled={loading}
                    autoComplete="username"
                    placeholder="Enter your email"
                    className="h-[50px] w-full rounded-lg border border-[#d5b36f] bg-white pl-11 pr-4 text-sm font-medium text-slate-950 caret-[#0b533a] outline-none transition placeholder:font-normal placeholder:text-slate-500 hover:border-[#bd9144] focus:border-[#0b533a] focus:ring-2 focus:ring-[#0b533a]/15 disabled:bg-slate-100 disabled:text-slate-600 [&:-webkit-autofill]:[-webkit-text-fill-color:#0f172a] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_white_inset]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0b533a]"
                  />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    disabled={loading}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="h-[50px] w-full rounded-lg border border-[#d5b36f] bg-white pl-11 pr-11 text-sm font-medium text-slate-950 caret-[#0b533a] outline-none transition placeholder:font-normal placeholder:text-slate-500 hover:border-[#bd9144] focus:border-[#0b533a] focus:ring-2 focus:ring-[#0b533a]/15 disabled:bg-slate-100 disabled:text-slate-600 [&:-webkit-autofill]:[-webkit-text-fill-color:#0f172a] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_white_inset]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value,
                      )
                    }
                    disabled={loading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0b533a]"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm">
                <label className="flex items-center gap-2 text-slate-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#0b533a]"
                  />

                  Remember me
                </label>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/forgot-password",
                    )
                  }
                  className="font-medium text-[#0b533a] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-[50px] w-full items-center justify-center gap-2 rounded-lg bg-[#0a5038] text-sm font-semibold text-white transition hover:bg-[#073e2c] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn
                      size={18}
                      className="text-[#e1b85e]"
                    />
                    Sign In
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-[11px] text-slate-400">
              Secure Gihombo Coffee Washing Station Management System
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
