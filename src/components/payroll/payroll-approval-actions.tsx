"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getApprovals,
  requestPayrollPaymentApproval,
} from "@/services/approval-service";

import type {
  ApprovalRequest,
} from "@/types/approval";

import type {
  DashboardRole,
  Payroll,
} from "@/types/payroll";

export default function PayrollApprovalActions({
  payroll,
  role,
  onPay,
  onChanged,
}: {
  payroll: Payroll;
  role: DashboardRole;
  onPay: () => void;
  onChanged?: (
    message: string,
  ) => void | Promise<void>;
}) {
  const [approval, setApproval] =
    useState<ApprovalRequest | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [busy, setBusy] =
    useState(false);

  const loadApproval =
    useCallback(async () => {
      setLoading(true);

      try {
        const result =
          await getApprovals({
            search:
              payroll.payroll_code,

            module:
              "payroll",

            action:
              "payment",

            per_page: 20,
          });

        const exact =
          result.items
            .filter(
              (item) =>
                item.reference_type ===
                  "payroll" &&
                item.reference_id ===
                  payroll.id &&
                item.action ===
                  "payment",
            )
            .sort(
              (a, b) =>
                b.id - a.id,
            )[0] ?? null;

        setApproval(exact);
      } finally {
        setLoading(false);
      }
    }, [
      payroll.id,
      payroll.payroll_code,
    ]);

  useEffect(() => {
    void loadApproval();
  }, [loadApproval]);

  async function requestApproval() {
    const confirmed =
      window.confirm(
        `Request payment approval for ${payroll.payroll_code} — ${payroll.employee_name}?`,
      );

    if (!confirmed) {
      return;
    }

    setBusy(true);

    try {
      const created =
        await requestPayrollPaymentApproval(
          payroll.id,
        );

      setApproval(created);

      await onChanged?.(
        `${created.approval_code} submitted for Admin approval.`,
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 px-3 text-xs font-bold text-slate-600">
        <LoaderCircle
          size={14}
          className="animate-spin"
        />
        Checking
      </span>
    );
  }

  if (
    approval?.status ===
    "approved"
  ) {
    return (
      <button
        type="button"
        onClick={onPay}
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#075b38] px-3 text-xs font-bold text-white"
      >
        <CheckCircle2
          size={14}
        />
        Pay
      </button>
    );
  }

  if (
    approval?.status ===
    "pending"
  ) {
    if (role === "admin") {
      return (
        <Link
          href="/dashboard/finance/approvals"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 text-xs font-bold text-amber-900"
        >
          <ShieldCheck
            size={14}
          />
          Review
        </Link>
      );
    }

    return (
      <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 text-xs font-bold text-amber-900">
        <Clock3 size={14} />
        Approval Pending
      </span>
    );
  }

  if (
    role === "accountant"
  ) {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={() =>
          void requestApproval()
        }
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#075b38] bg-white px-3 text-xs font-bold text-[#075b38] hover:bg-emerald-50 disabled:opacity-50"
      >
        {busy ? (
          <LoaderCircle
            size={14}
            className="animate-spin"
          />
        ) : (
          <ShieldCheck
            size={14}
          />
        )}

        Request Approval
      </button>
    );
  }

  return (
    <span className="inline-flex h-9 items-center rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs font-bold text-slate-600">
      Waiting for Accountant
    </span>
  );
}
