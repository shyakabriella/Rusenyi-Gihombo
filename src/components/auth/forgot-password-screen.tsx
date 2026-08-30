"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  Mail,
  ShieldCheck,
} from "lucide-react";
import {
  FormEvent,
  useState,
} from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:8000/api";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] =
    useState(false);
  const [error, setError] = useState("");
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

    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/forgot-password`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ??
            "Unable to send password reset link.",
        );
      }

      setSuccess(
        result?.message ??
          "If an account exists for this email, a password reset link has been sent.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to send password reset link.",
      );
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
              alt="Rusenyi High Lands Speciality Coffee Limited"
              width={150}
              height={150}
              priority
              className="h-[145px] w-[145px] object-contain"
            />

            <h1 className="mt-6 font-serif text-[35px] font-semibold text-[#fff4dc]">
              Account Recovery
            </h1>

            <div className="my-4 flex items-center gap-3">
              <span className="h-px w-16 bg-[#d9ad59]" />
              <span className="h-2 w-2 rounded-full border border-[#e4c176]" />
              <span className="h-px w-16 bg-[#d9ad59]" />
            </div>

            <p className="max-w-[300px] text-sm leading-6 text-[#f8ecd5]">
              Securely recover access to your
              Coffee Washing Station
              Management account.
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="flex items-center justify-center px-6 py-8 sm:px-10 lg:px-14">
          <div className="w-full max-w-[410px]">
            <div className="mb-5 flex justify-center lg:hidden">
              <Image
                src="/logo.png"
                alt="Rusenyi High Lands Speciality Coffee Limited"
                width={90}
                height={90}
                priority
                className="h-[90px] w-[90px] object-contain"
              />
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f5e5c5] text-[#075038]">
                <ShieldCheck
                  size={25}
                  strokeWidth={1.7}
                />
              </div>

              <h1 className="mt-4 font-serif text-[32px] font-semibold text-[#2f1d11]">
                Forgot Password?
              </h1>

              <div className="mx-auto mt-3 h-[2px] w-9 bg-[#d3a348]" />

              <p className="mx-auto mt-4 max-w-[330px] text-sm leading-6 text-slate-600">
                Enter the email address associated
                with your account and we will send
                password reset instructions.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-4"
            >
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{success}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-900"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0b533a]"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value,
                      )
                    }
                    disabled={loading}
                    autoComplete="email"
                    placeholder="Enter your email address"
                    className="h-[50px] w-full rounded-lg border border-[#d5b36f] bg-white pl-11 pr-4 text-sm font-medium text-slate-950 caret-[#0b533a] outline-none transition placeholder:font-normal placeholder:text-slate-500 hover:border-[#bd9144] focus:border-[#0b533a] focus:ring-2 focus:ring-[#0b533a]/15 disabled:bg-slate-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-[50px] w-full items-center justify-center gap-2 rounded-lg bg-[#0a5038] text-sm font-semibold text-white transition-all duration-200 hover:bg-[#073e2c] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />

                    Sending...
                  </>
                ) : (
                  <>
                    <Mail
                      size={18}
                      className="text-[#e1b85e]"
                    />

                    Send Reset Link
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0b533a] transition hover:gap-3 hover:underline"
              >
                <ArrowLeft size={16} />

                Back to Sign In
              </Link>
            </div>

            <p className="mt-7 text-center text-[11px] text-slate-500">
              Secure Gihombo Coffee Washing
              Station Management System
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
