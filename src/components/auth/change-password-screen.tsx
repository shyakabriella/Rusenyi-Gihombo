"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";

import { ApiError } from "@/lib/api";
import { getToken } from "@/lib/auth-storage";
import { changePassword } from "@/services/auth-service";

export default function ChangePasswordScreen() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/");
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setSuccess("");

    if (!currentPassword) {
      setError("Enter your current password.");
      return;
    }

    if (!password) {
      setError("Enter your new password.");
      return;
    }

    if (password.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Password confirmation does not match.");
      return;
    }

    if (currentPassword === password) {
      setError("New password must be different from your current password.");
      return;
    }

    setLoading(true);

    try {
      const response = await changePassword({
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      });

      setSuccess(
        response.message || "Password changed successfully.",
      );

      router.replace("/dashboard");
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unable to change password.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4ecdf] p-4">
      <section className="w-full max-w-[460px] rounded-2xl border border-[#e4d8c6] bg-white px-7 py-8 shadow-[0_15px_40px_rgba(40,30,20,0.13)] sm:px-9">
        <div className="text-center">
          <Image
            src="/logo.png"
            alt="Gihombo Coffee Washing Station"
            width={95}
            height={95}
            priority
            className="mx-auto h-[90px] w-[90px] object-contain"
          />

          <div className="mx-auto mt-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#f5e5c5] text-[#075038]">
            <KeyRound size={22} />
          </div>

          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            Change Password
          </h1>

          <p className="mt-2 text-sm leading-5 text-slate-500">
            You are using a temporary password.
            <br />
            Create a new password to continue.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-4"
        >
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0"
              />

              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
              <CheckCircle2
                size={17}
                className="shrink-0"
              />

              <span>{success}</span>
            </div>
          )}

          <PasswordField
            id="current-password"
            label="Current Password"
            value={currentPassword}
            show={showCurrentPassword}
            disabled={loading}
            placeholder="Enter temporary password"
            onChange={setCurrentPassword}
            onToggle={() =>
              setShowCurrentPassword((value) => !value)
            }
          />

          <PasswordField
            id="new-password"
            label="New Password"
            value={password}
            show={showPassword}
            disabled={loading}
            placeholder="Enter new password"
            onChange={setPassword}
            onToggle={() =>
              setShowPassword((value) => !value)
            }
          />

          <PasswordField
            id="password-confirmation"
            label="Confirm New Password"
            value={passwordConfirmation}
            show={showConfirmation}
            disabled={loading}
            placeholder="Repeat new password"
            onChange={setPasswordConfirmation}
            onToggle={() =>
              setShowConfirmation((value) => !value)
            }
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-[50px] w-full items-center justify-center gap-2 rounded-lg bg-[#0a5038] text-sm font-semibold text-white transition hover:bg-[#073e2c] disabled:cursor-not-allowed disabled:opacity-60"
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
              <>
                <KeyRound
                  size={18}
                  className="text-[#e1b85e]"
                />

                Change Password
              </>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-[11px] text-slate-400">
          Gihombo Coffee Washing Station
        </p>
      </section>
    </main>
  );
}

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  show: boolean;
  disabled: boolean;
  placeholder: string;
  onChange: (value: string) => void;
  onToggle: () => void;
};

function PasswordField({
  id,
  label,
  value,
  show,
  disabled,
  placeholder,
  onChange,
  onToggle,
}: PasswordFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-800"
      >
        {label}
      </label>

      <div className="relative">
        <LockKeyhole
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0b533a]"
        />

        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete="new-password"
          className="h-[50px] w-full rounded-lg border border-[#dec18a] bg-white pl-11 pr-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0b533a] focus:ring-2 focus:ring-[#0b533a]/10 disabled:bg-slate-50"
        />

        <button
          type="button"
          disabled={disabled}
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0b533a]"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
