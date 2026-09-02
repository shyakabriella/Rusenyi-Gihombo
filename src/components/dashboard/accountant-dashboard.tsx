"use client";

import Link from "next/link";

import {
  Banknote,
  BadgeDollarSign,
  Coffee,
  HandCoins,
  ReceiptText,
  RefreshCw,
} from "lucide-react";

import {
  useDashboardOverview,
} from "@/hooks/use-dashboard-overview";

function money(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 0,
    },
  ).format(value);
}

function FinanceCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Banknote;
}) {
  return (
    <div className="rounded-xl border border-[#eee4d6] bg-white p-4 shadow-[0_2px_10px_rgba(64,43,16,0.04)]">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f6ead8] text-[#155f3d]">
          <Icon size={20} />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-600">
            {label}
          </p>

          <p className="mt-2 truncate text-[19px] font-semibold text-slate-950">
            {money(value)}
          </p>

          <p className="mt-1 text-[9px] text-slate-500">
            RWF
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AccountantDashboard() {
  const {
    data,
    loading,
    error,
    refresh,
  } = useDashboardOverview();

  if (
    loading &&
    !data
  ) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="h-[105px] animate-pulse rounded-xl border border-[#eee4d6] bg-white"
          />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm text-red-700">
          {error ||
            "Unable to load finance dashboard."}
        </p>

        <button
          type="button"
          onClick={() =>
            void refresh()
          }
          className="mt-4 rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FinanceCard
          label="Money Used Today"
          value={
            data.cards
              .money_used_today
              .value
          }
          icon={HandCoins}
        />

        <FinanceCard
          label="Available Cash"
          value={
            data.finance
              .available_operational_cash
          }
          icon={
            BadgeDollarSign
          }
        />

        <FinanceCard
          label="Agent Wallet Balance"
          value={
            data.finance
              .agent_wallet_balance
          }
          icon={Banknote}
        />

        <FinanceCard
          label="Petty Cash Balance"
          value={
            data.finance
              .petty_cash_balance
          }
          icon={ReceiptText}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-xl border border-[#eee4d6] bg-white">
          <div className="border-b border-[#f1e8dc] px-4 py-3">
            <h2 className="font-serif text-[13px] font-semibold text-slate-900">
              Today&apos;s Spending
            </h2>
          </div>

          <div className="divide-y divide-slate-100 px-4">
            {[
              [
                "Coffee Purchases",
                data.finance
                  .coffee_purchase_spending_today,
              ],
              [
                "Direct Farmer Payments",
                data.finance
                  .direct_farmer_payments_today,
              ],
              [
                "Operating Expenses",
                data.finance
                  .expenses_today,
              ],
            ].map(
              ([label, value]) => (
                <div
                  key={
                    label as string
                  }
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div className="flex items-center gap-2">
                    <Coffee
                      size={15}
                      className="text-[#155f3d]"
                    />

                    <span className="text-xs font-medium text-slate-600">
                      {label}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-slate-950">
                    {money(
                      Number(value),
                    )}{" "}
                    RWF
                  </span>
                </div>
              ),
            )}
          </div>
        </section>

        <section className="rounded-xl border border-[#eee4d6] bg-white">
          <div className="border-b border-[#f1e8dc] px-4 py-3">
            <h2 className="font-serif text-[13px] font-semibold text-slate-900">
              Finance Attention
            </h2>
          </div>

          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between rounded-lg bg-[#faf7f1] px-4 py-3">
              <span className="text-xs font-medium text-slate-600">
                Pending Approvals
              </span>

              <span className="text-lg font-bold text-slate-950">
                {
                  data.operations
                    .pending_approvals
                }
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-[#faf7f1] px-4 py-3">
              <span className="text-xs font-medium text-slate-600">
                Coffee Purchased Today
              </span>

              <span className="text-sm font-bold text-slate-950">
                {money(
                  data.cards
                    .coffee_purchased_today
                    .value,
                )}{" "}
                KG
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Link
                href="/dashboard/finance/approvals"
                className="rounded-lg bg-[#155f3d] px-4 py-2 text-[10px] font-semibold text-white"
              >
                Approvals
              </Link>

              <Link
                href="/dashboard/finance/expenses"
                className="rounded-lg border border-[#e6dbc9] px-4 py-2 text-[10px] font-semibold text-slate-700"
              >
                Expenses
              </Link>

              <Link
                href="/dashboard/reports"
                className="rounded-lg border border-[#e6dbc9] px-4 py-2 text-[10px] font-semibold text-slate-700"
              >
                Reports
              </Link>
            </div>
          </div>
        </section>
      </div>

      {error ? (
        <p className="text-xs text-amber-700">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() =>
            void refresh()
          }
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-[#e6dbc9] bg-white px-3 py-2 text-[10px] font-semibold text-slate-600"
        >
          <RefreshCw
            size={14}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh Dashboard
        </button>
      </div>
    </div>
  );
}
