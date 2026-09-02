import Link from "next/link";
import type { ReactNode } from "react";

import {
  Banknote,
  ChevronRight,
  Coins,
  ReceiptText,
  ShieldCheck,
  UsersRound,
  WalletCards,
} from "lucide-react";

export default function FinancePage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Finance
        </h1>

        <p className="mt-1 text-sm font-medium text-slate-600">
          Manage coffee purchasing funds and financial operations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <FinanceCard
          href="/dashboard/finance/cash-allocations"
          title="Cash Allocations"
          description="Allocate purchasing cash to agents, approve allocations and manage cancellations."
          icon={<Banknote size={22} />}
        />

        <FinanceCard
          href="/dashboard/finance/agent-wallets"
          title="Agent Cash Wallets"
          description="View money received, spent, reversed and remaining for each field agent."
          icon={<WalletCards size={22} />}
        />

        <FinanceCard
          href="/dashboard/finance/expenses"
          title="Expenses"
          description="Record and monitor operational expenses, payees, payments, receipts and financial accountability."
          icon={<ReceiptText size={22} />}
        />

        <FinanceCard
          href="/dashboard/finance/petty-cash"
          title="Petty Cash"
          description="Manage small operational cash funding, expenses, balances and transaction reversals."
          icon={<Coins size={22} />}
        />

        <FinanceCard
          href="/dashboard/finance/payroll"
          title="Payroll"
          description="Prepare monthly salaries, process Payroll and record employee salary payments."
          icon={<UsersRound size={22} />}
        />

        <FinanceCard
          href="/dashboard/finance/approvals"
          title="Approvals"
          description="Review pending financial requests, approve or reject actions and track authorization history."
          icon={<ShieldCheck size={22} />}
        />
      </div>
    </div>
  );
}

function FinanceCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-[#e5ded4] bg-white p-5 shadow-sm transition hover:border-[#c8ad82] hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f6e7d2] text-[#075b38]">
          {icon}
        </div>

        <ChevronRight
          size={19}
          className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#075b38]"
        />
      </div>

      <h2 className="mt-5 text-lg font-bold text-slate-950">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </Link>
  );
}
