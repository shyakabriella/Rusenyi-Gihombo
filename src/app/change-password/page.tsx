"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";

import { ApiError } from "@/lib/api";
import { changePassword } from "@/services/auth-service";

export default function ChangePasswordPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmation, setConfirmation] =
    useState("");

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

    if (!currentPassword) {
      setError("Enter your temporary password.");
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "New password must be at least 8 characters.",
      );
      return;
    }

    if (newPassword !== confirmation) {
      setError(
        "New password and confirmation do not match.",
      );
      return;
    }

    setLoading(true);

    try {
      await changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmation,
      });

      setSuccess(
        "Password changed successfully.",
      );

      router.replace("/dashboard");
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Unable to change password.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4ecdf] p-4">
      <section className="w-full max-w-md rounded-2xl border border-[#e4d8c6] bg-white p-7 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f5e5c5] text-[#075038]">
            <LockKeyhole size={24} />
          </div>

          <h1 className="mt-4 text-2xl font-bold text-[#2f1d11]">
            Change Password
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            You are using a temporary password.
            Create a new password before continuing.
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

              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              <CheckCircle2
                size={18}
                className="shrink-0"
              />

              <span>{success}</span>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Current / Temporary Password
            </label>

            <input
              type="password"
              value={currentPassword}
              onChange={(event) =>
                setCurrentPassword(
                  event.target.value,
                )
              }
              autoComplete="current-password"
              className="h-12 w-full rounded-lg border border-[#dec18a] px-4 outline-none focus:border-[#0b533a]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              New Password
            </label>

            <input
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(
                  event.target.value,
                )
              }
              autoComplete="new-password"
              className="h-12 w-full rounded-lg border border-[#dec18a] px-4 outline-none focus:border-[#0b533a]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Confirm New Password
            </label>

            <input
              type="password"
              value={confirmation}
              onChange={(event) =>
                setConfirmation(
                  event.target.value,
                )
              }
              autoComplete="new-password"
              className="h-12 w-full rounded-lg border border-[#dec18a] px-4 outline-none focus:border-[#0b533a]"
            />
          </div>

          <button
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#0a5038] font-semibold text-white hover:bg-[#073e2c] disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
                Updating...
              </>
            ) : (
              "Change Password"
            )}
          </button>
        </form>
      </section>
    </main>
  );
}
