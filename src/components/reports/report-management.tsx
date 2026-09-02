"use client";

import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  Coffee,
  Download,
  FileText,
  LoaderCircle,
  Printer,
  RefreshCcw,
  ShieldCheck,
  UsersRound,
  WalletCards,
} from "lucide-react";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getApprovalReport,
  getFinanceReport,
  getOperationsReport,
  getPayrollReport,
  getReportOverview,
} from "@/services/report-service";

import type {
  ApprovalReport,
  FinanceReport,
  OperationsReport,
  PayrollReport,
  ReportOverview,
} from "@/types/report";

type ReportTab =
  | "overview"
  | "finance"
  | "operations"
  | "payroll"
  | "approvals";

const inputClass =
  "h-11 rounded-lg border border-slate-400 bg-white px-3 text-sm font-medium text-slate-950 outline-none focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

export default function ReportManagement() {
  const [tab, setTab] =
    useState<ReportTab>(
      "overview",
    );

  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");

  const [filters, setFilters] =
    useState({
      date_from: "",
      date_to: "",
    });

  const [overview, setOverview] =
    useState<ReportOverview | null>(
      null,
    );

  const [finance, setFinance] =
    useState<FinanceReport | null>(
      null,
    );

  const [operations, setOperations] =
    useState<OperationsReport | null>(
      null,
    );

  const [payroll, setPayroll] =
    useState<PayrollReport | null>(
      null,
    );

  const [approvals, setApprovals] =
    useState<ApprovalReport | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const load =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const query = {
          date_from:
            filters.date_from ||
            undefined,

          date_to:
            filters.date_to ||
            undefined,
        };

        const [
          overviewResult,
          financeResult,
          operationsResult,
          payrollResult,
          approvalResult,
        ] = await Promise.all([
          getReportOverview(query),
          getFinanceReport(query),
          getOperationsReport(query),
          getPayrollReport(query),
          getApprovalReport(query),
        ]);

        setOverview(
          overviewResult,
        );

        setFinance(
          financeResult,
        );

        setOperations(
          operationsResult,
        );

        setPayroll(
          payrollResult,
        );

        setApprovals(
          approvalResult,
        );
      } catch (error) {
        setError(
          errorMessage(error),
        );
      } finally {
        setLoading(false);
      }
    }, [filters]);

  useEffect(() => {
    void load();
  }, [load]);

  function applyFilters() {
    if (
      dateFrom &&
      dateTo &&
      dateFrom > dateTo
    ) {
      setError(
        "Date To must be the same as or after Date From.",
      );

      return;
    }

    setFilters({
      date_from: dateFrom,
      date_to: dateTo,
    });
  }

  function resetFilters() {
    setDateFrom("");
    setDateTo("");

    setFilters({
      date_from: "",
      date_to: "",
    });
  }

  function thisMonth() {
    const now =
      new Date();

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() + 1,
      ).padStart(2, "0");

    const lastDay =
      new Date(
        year,
        now.getMonth() + 1,
        0,
      ).getDate();

    const from =
      `${year}-${month}-01`;

    const to =
      `${year}-${month}-${String(
        lastDay,
      ).padStart(2, "0")}`;

    setDateFrom(from);
    setDateTo(to);

    setFilters({
      date_from: from,
      date_to: to,
    });
  }

  function exportCsv() {
    const rows =
      buildCsvRows(
        tab,
        overview,
        finance,
        operations,
        payroll,
        approvals,
      );

    if (!rows.length) {
      return;
    }

    const csv = rows
      .map(
        (row) =>
          row
            .map(csvValue)
            .join(","),
      )
      .join("\n");

    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;",
        },
      );

    const url =
      URL.createObjectURL(
        blob,
      );

    const link =
      document.createElement(
        "a",
      );

    link.href = url;

    link.download =
      `rusenyi-${tab}-report-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(
      link,
    );

    link.click();
    link.remove();

    URL.revokeObjectURL(
      url,
    );
  }

  return (
    <div className="space-y-5 text-slate-950">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">
            Reports
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-700">
            Review financial,
            payroll, approval and
            coffee operation
            performance.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 print:hidden">
          <button
            type="button"
            onClick={exportCsv}
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#075b38] bg-white px-4 text-sm font-bold text-[#075b38] disabled:opacity-40"
          >
            <Download
              size={16}
            />
            Export CSV
          </button>

          <button
            type="button"
            onClick={() =>
              window.print()
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#075b38] px-4 text-sm font-bold text-white"
          >
            <Printer
              size={16}
            />
            Print
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm print:hidden">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
          <Field label="Date From">
            <input
              type="date"
              value={dateFrom}
              onChange={(
                event,
              ) =>
                setDateFrom(
                  event.target
                    .value,
                )
              }
              className={
                inputClass
              }
            />
          </Field>

          <Field label="Date To">
            <input
              type="date"
              value={dateTo}
              onChange={(
                event,
              ) =>
                setDateTo(
                  event.target
                    .value,
                )
              }
              className={
                inputClass
              }
            />
          </Field>

          <button
            type="button"
            onClick={
              thisMonth
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#c7ac7f] bg-[#fffaf2] px-4 text-sm font-bold text-[#80570f]"
          >
            <CalendarDays
              size={16}
            />
            This Month
          </button>

          <button
            type="button"
            onClick={
              applyFilters
            }
            className="h-11 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white"
          >
            Apply
          </button>

          <button
            type="button"
            onClick={
              resetFilters
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-400 px-4 text-sm font-bold"
          >
            <RefreshCcw
              size={15}
            />
            Reset
          </button>

          <div className="xl:ml-auto">
            <p className="text-xs font-bold uppercase text-slate-500">
              Report Period
            </p>

            <p className="mt-1 text-sm font-extrabold">
              {periodLabel(
                filters.date_from,
                filters.date_to,
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 print:hidden">
        <TabButton
          active={
            tab === "overview"
          }
          onClick={() =>
            setTab(
              "overview",
            )
          }
        >
          Overview
        </TabButton>

        <TabButton
          active={
            tab === "finance"
          }
          onClick={() =>
            setTab(
              "finance",
            )
          }
        >
          Finance
        </TabButton>

        <TabButton
          active={
            tab ===
            "operations"
          }
          onClick={() =>
            setTab(
              "operations",
            )
          }
        >
          Coffee Operations
        </TabButton>

        <TabButton
          active={
            tab === "payroll"
          }
          onClick={() =>
            setTab(
              "payroll",
            )
          }
        >
          Payroll
        </TabButton>

        <TabButton
          active={
            tab ===
            "approvals"
          }
          onClick={() =>
            setTab(
              "approvals",
            )
          }
        >
          Approvals
        </TabButton>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[380px] items-center justify-center rounded-xl border border-slate-300 bg-white">
          <LoaderCircle
            size={34}
            className="animate-spin text-[#075b38]"
          />
        </div>
      ) : (
        <>
          {tab ===
            "overview" &&
            overview && (
              <OverviewTab
                report={
                  overview
                }
              />
            )}

          {tab ===
            "finance" &&
            finance && (
              <FinanceTab
                report={
                  finance
                }
              />
            )}

          {tab ===
            "operations" &&
            operations && (
              <OperationsTab
                report={
                  operations
                }
              />
            )}

          {tab ===
            "payroll" &&
            payroll && (
              <PayrollTab
                report={
                  payroll
                }
              />
            )}

          {tab ===
            "approvals" &&
            approvals && (
              <ApprovalTab
                report={
                  approvals
                }
              />
            )}
        </>
      )}

      {overview && (
        <p className="pb-4 text-right text-xs font-medium text-slate-500">
          Generated{" "}
          {formatDateTime(
            overview.generated_at,
          )}
        </p>
      )}
    </div>
  );
}

function OverviewTab({
  report,
}: {
  report: ReportOverview;
}) {
  const operations =
    report.operations;

  const operationTotal =
    operations.coffee_purchases +
    operations.direct_farmer_deliveries +
    operations.agent_collections +
    operations.field_weighings +
    operations.collection_trips +
    operations.factory_receptions;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Operational Spending"
          value={money(
            report.finance
              .total_operational_spending,
          )}
          icon={
            <Banknote
              size={19}
            />
          }
        />

        <Metric
          title="Payroll Paid"
          value={money(
            report.payroll
              .paid_amount,
          )}
          icon={
            <UsersRound
              size={19}
            />
          }
        />

        <Metric
          title="Pending Approvals"
          value={String(
            report.approvals
              .pending,
          )}
          icon={
            <ShieldCheck
              size={19}
            />
          }
        />

        <Metric
          title="Core Operations"
          value={String(
            operationTotal,
          )}
          icon={
            <Coffee size={19} />
          }
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ReportCard
          title="Finance Overview"
          icon={
            <WalletCards
              size={19}
            />
          }
        >
          <ReportRows
            rows={[
              [
                "Recorded Expenses",
                String(
                  report.finance
                    .expenses
                    .recorded_count,
                ),
              ],
              [
                "Expense Amount",
                money(
                  report.finance
                    .expenses
                    .recorded_amount,
                ),
              ],
              [
                "Petty Cash Balance",
                money(
                  report.finance
                    .petty_cash
                    .current_balance,
                ),
              ],
            ]}
          />
        </ReportCard>

        <ReportCard
          title="Payroll Overview"
          icon={
            <UsersRound
              size={19}
            />
          }
        >
          <ReportRows
            rows={[
              [
                "Payroll Records",
                String(
                  report.payroll
                    .total_records,
                ),
              ],
              [
                "Paid",
                String(
                  report.payroll
                    .paid_count,
                ),
              ],
              [
                "Outstanding",
                money(
                  report.payroll
                    .outstanding_amount,
                ),
              ],
            ]}
          />
        </ReportCard>

        <ReportCard
          title="Approvals Overview"
          icon={
            <ShieldCheck
              size={19}
            />
          }
        >
          <ReportRows
            rows={[
              [
                "Total Requests",
                String(
                  report.approvals
                    .total,
                ),
              ],
              [
                "Pending",
                String(
                  report.approvals
                    .pending,
                ),
              ],
              [
                "Approved",
                String(
                  report.approvals
                    .approved,
                ),
              ],
            ]}
          />
        </ReportCard>

        <ReportCard
          title="Coffee Operations"
          icon={
            <Coffee size={19} />
          }
        >
          <ReportRows
            rows={[
              [
                "Coffee Purchases",
                String(
                  operations
                    .coffee_purchases,
                ),
              ],
              [
                "Direct Deliveries",
                String(
                  operations
                    .direct_farmer_deliveries,
                ),
              ],
              [
                "Factory Receptions",
                String(
                  operations
                    .factory_receptions,
                ),
              ],
            ]}
          />
        </ReportCard>
      </div>
    </div>
  );
}

function FinanceTab({
  report,
}: {
  report: FinanceReport;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Recorded Expenses"
          value={money(
            report.expenses
              .recorded_amount,
          )}
          icon={
            <Banknote
              size={19}
            />
          }
        />

        <Metric
          title="Petty Cash Funded"
          value={money(
            report.petty_cash
              .funding_amount,
          )}
          icon={
            <WalletCards
              size={19}
            />
          }
        />

        <Metric
          title="Petty Cash Spent"
          value={money(
            report.petty_cash
              .expense_amount,
          )}
          icon={
            <FileText
              size={19}
            />
          }
        />

        <Metric
          title="Petty Cash Balance"
          value={money(
            report.petty_cash
              .current_balance,
          )}
          icon={
            <CheckCircle2
              size={19}
            />
          }
        />
      </div>

      <ReportTable
        headers={[
          "Category",
          "Transactions",
          "Amount",
        ]}
        rows={[
          [
            "Recorded Expenses",
            String(
              report.expenses
                .recorded_count,
            ),
            money(
              report.expenses
                .recorded_amount,
            ),
          ],

          [
            "Cancelled Expenses",
            String(
              report.expenses
                .cancelled_count,
            ),
            money(
              report.expenses
                .cancelled_amount,
            ),
          ],

          [
            "Petty Cash Funding",
            String(
              report.petty_cash
                .funding_count,
            ),
            money(
              report.petty_cash
                .funding_amount,
            ),
          ],

          [
            "Petty Cash Expenses",
            String(
              report.petty_cash
                .expense_count,
            ),
            money(
              report.petty_cash
                .expense_amount,
            ),
          ],
        ]}
      />
    </div>
  );
}

function OperationsTab({
  report,
}: {
  report: OperationsReport;
}) {
  const rows: [
    string,
    number,
  ][] = [
    [
      "Coffee Purchases",
      report.coffee_purchases,
    ],
    [
      "Direct Farmer Deliveries",
      report.direct_farmer_deliveries,
    ],
    [
      "Agent Collections",
      report.agent_collections,
    ],
    [
      "Field Weighings",
      report.field_weighings,
    ],
    [
      "Collection Trips",
      report.collection_trips,
    ],
    [
      "Factory Receptions",
      report.factory_receptions,
    ],
    [
      "Coffee Lots / Batches",
      report.coffee_lots,
    ],
    [
      "Store Inventories",
      report.store_inventories,
    ],
    [
      "Stock Movements",
      report.stock_movements,
    ],
    [
      "Processing Batches",
      report.processing_batches,
    ],
  ];

  const max =
    Math.max(
      ...rows.map(
        ([, value]) =>
          value,
      ),
      1,
    );

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
      <ReportCard
        title="Operation Activity"
        icon={<Coffee size={19} />}
      >
        <div className="space-y-4">
          {rows.map(
            ([title, value]) => (
              <div
                key={title}
              >
                <div className="mb-1 flex items-center justify-between gap-4">
                  <span className="text-sm font-bold">
                    {title}
                  </span>

                  <span className="text-sm font-extrabold">
                    {value}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-[#075b38]"
                    style={{
                      width:
                        `${Math.max(
                          value > 0
                            ? 5
                            : 0,
                          Math.round(
                            (value /
                              max) *
                              100,
                          ),
                        )}%`,
                    }}
                  />
                </div>
              </div>
            ),
          )}
        </div>
      </ReportCard>

      <ReportTable
        headers={[
          "Operation",
          "Records",
        ]}
        rows={rows.map(
          ([title, value]) => [
            title,
            String(value),
          ],
        )}
      />
    </div>
  );
}

function PayrollTab({
  report,
}: {
  report: PayrollReport;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Gross Salary"
          value={money(
            report.gross_salary,
          )}
          icon={
            <UsersRound
              size={19}
            />
          }
        />

        <Metric
          title="Net Salary"
          value={money(
            report.net_salary,
          )}
          icon={
            <Banknote
              size={19}
            />
          }
        />

        <Metric
          title="Paid"
          value={money(
            report.paid_amount,
          )}
          icon={
            <CheckCircle2
              size={19}
            />
          }
        />

        <Metric
          title="Outstanding"
          value={money(
            report.outstanding_amount,
          )}
          icon={
            <WalletCards
              size={19}
            />
          }
        />
      </div>

      <ReportTable
        headers={[
          "Payroll Status",
          "Records",
        ]}
        rows={[
          [
            "Draft",
            String(
              report.draft_count,
            ),
          ],
          [
            "Processed",
            String(
              report.processed_count,
            ),
          ],
          [
            "Paid",
            String(
              report.paid_count,
            ),
          ],
          [
            "Cancelled",
            String(
              report.cancelled_count,
            ),
          ],
          [
            "Total",
            String(
              report.total_records,
            ),
          ],
        ]}
      />

      <ReportTable
        headers={[
          "Salary Measure",
          "Amount",
        ]}
        rows={[
          [
            "Gross Salary",
            money(
              report.gross_salary,
            ),
          ],
          [
            "Deductions",
            money(
              report.deductions,
            ),
          ],
          [
            "Net Salary",
            money(
              report.net_salary,
            ),
          ],
          [
            "Paid Amount",
            money(
              report.paid_amount,
            ),
          ],
          [
            "Outstanding",
            money(
              report.outstanding_amount,
            ),
          ],
        ]}
      />
    </div>
  );
}

function ApprovalTab({
  report,
}: {
  report: ApprovalReport;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Pending"
          value={String(
            report.pending,
          )}
          icon={
            <ShieldCheck
              size={19}
            />
          }
        />

        <Metric
          title="Approved"
          value={String(
            report.approved,
          )}
          icon={
            <CheckCircle2
              size={19}
            />
          }
        />

        <Metric
          title="Pending Amount"
          value={money(
            report.pending_amount,
          )}
          icon={
            <Banknote
              size={19}
            />
          }
        />

        <Metric
          title="Applied Amount"
          value={money(
            report.applied_amount,
          )}
          icon={
            <WalletCards
              size={19}
            />
          }
        />
      </div>

      <ReportTable
        headers={[
          "Approval Status",
          "Requests",
        ]}
        rows={[
          [
            "Pending",
            String(
              report.pending,
            ),
          ],
          [
            "Approved",
            String(
              report.approved,
            ),
          ],
          [
            "Rejected",
            String(
              report.rejected,
            ),
          ],
          [
            "Cancelled",
            String(
              report.cancelled,
            ),
          ],
          [
            "Total",
            String(
              report.total,
            ),
          ],
        ]}
      />

      <ReportTable
        headers={[
          "Approval Amount",
          "Amount",
        ]}
        rows={[
          [
            "Pending Amount",
            money(
              report.pending_amount,
            ),
          ],
          [
            "Approved Amount",
            money(
              report.approved_amount,
            ),
          ],
          [
            "Applied Amount",
            money(
              report.applied_amount,
            ),
          ],
        ]}
      />
    </div>
  );
}

function ReportTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[540px]">
          <thead className="bg-[#f6f1e8]">
            <tr>
              {headers.map(
                (header) => (
                  <th
                    key={header}
                    className="px-4 py-4 text-left text-xs font-extrabold uppercase text-slate-700"
                  >
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody>
            {rows.map(
              (row, rowIndex) => (
                <tr
                  key={
                    rowIndex
                  }
                  className="border-t border-slate-200"
                >
                  {row.map(
                    (
                      value,
                      columnIndex,
                    ) => (
                      <td
                        key={
                          columnIndex
                        }
                        className={`px-4 py-4 text-sm ${
                          columnIndex ===
                          0
                            ? "font-bold"
                            : "font-extrabold text-[#075b38]"
                        }`}
                      >
                        {value}
                      </td>
                    ),
                  )}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-300 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-[#075b38]">
          {icon}
        </span>

        <h2 className="text-lg font-extrabold">
          {title}
        </h2>
      </div>

      {children}
    </section>
  );
}

function ReportRows({
  rows,
}: {
  rows: [
    string,
    string,
  ][];
}) {
  return (
    <div className="divide-y divide-slate-200">
      {rows.map(
        ([title, value]) => (
          <div
            key={title}
            className="flex items-center justify-between gap-5 py-3"
          >
            <span className="text-sm font-medium text-slate-700">
              {title}
            </span>

            <span className="text-sm font-extrabold">
              {value}
            </span>
          </div>
        ),
      )}
    </div>
  );
}

function Metric({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-extrabold uppercase text-slate-700">
          {title}
        </p>

        <span className="text-[#075b38]">
          {icon}
        </span>
      </div>

      <p className="mt-2 text-2xl font-extrabold">
        {value}
      </p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 shrink-0 rounded-lg px-4 text-sm font-bold ${
        active
          ? "bg-[#075b38] text-white"
          : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-extrabold uppercase text-slate-600">
        {label}
      </label>

      {children}
    </div>
  );
}

function money(
  value: string | number,
) {
  const amount =
    Number(value);

  return `${new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 0,
    },
  ).format(
    Number.isFinite(amount)
      ? amount
      : 0,
  )} RWF`;
}

function periodLabel(
  from?: string,
  to?: string,
) {
  if (!from && !to) {
    return "All available records";
  }

  if (from && to) {
    return `${from} → ${to}`;
  }

  if (from) {
    return `From ${from}`;
  }

  return `Up to ${to}`;
}

function formatDateTime(
  value?: string | null,
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

function csvValue(
  value: string,
) {
  return `"${value.replaceAll(
    '"',
    '""',
  )}"`;
}

function buildCsvRows(
  tab: ReportTab,
  overview: ReportOverview | null,
  finance: FinanceReport | null,
  operations: OperationsReport | null,
  payroll: PayrollReport | null,
  approvals: ApprovalReport | null,
): string[][] {
  if (
    tab === "overview" &&
    overview
  ) {
    return [
      [
        "Section",
        "Metric",
        "Value",
      ],

      [
        "Finance",
        "Recorded Expenses",
        overview.finance
          .expenses
          .recorded_amount,
      ],

      [
        "Finance",
        "Petty Cash Balance",
        overview.finance
          .petty_cash
          .current_balance,
      ],

      [
        "Payroll",
        "Paid Amount",
        overview.payroll
          .paid_amount,
      ],

      [
        "Payroll",
        "Outstanding Amount",
        overview.payroll
          .outstanding_amount,
      ],

      [
        "Approvals",
        "Pending",
        String(
          overview.approvals
            .pending,
        ),
      ],

      [
        "Operations",
        "Coffee Purchases",
        String(
          overview.operations
            .coffee_purchases,
        ),
      ],

      [
        "Operations",
        "Factory Receptions",
        String(
          overview.operations
            .factory_receptions,
        ),
      ],
    ];
  }

  if (
    tab === "finance" &&
    finance
  ) {
    return [
      [
        "Metric",
        "Count",
        "Amount",
      ],

      [
        "Recorded Expenses",
        String(
          finance.expenses
            .recorded_count,
        ),
        finance.expenses
          .recorded_amount,
      ],

      [
        "Cancelled Expenses",
        String(
          finance.expenses
            .cancelled_count,
        ),
        finance.expenses
          .cancelled_amount,
      ],

      [
        "Petty Cash Funding",
        String(
          finance.petty_cash
            .funding_count,
        ),
        finance.petty_cash
          .funding_amount,
      ],

      [
        "Petty Cash Expenses",
        String(
          finance.petty_cash
            .expense_count,
        ),
        finance.petty_cash
          .expense_amount,
      ],

      [
        "Petty Cash Balance",
        "",
        finance.petty_cash
          .current_balance,
      ],
    ];
  }

  if (
    tab === "operations" &&
    operations
  ) {
    return [
      [
        "Operation",
        "Records",
      ],
      [
        "Coffee Purchases",
        String(
          operations
            .coffee_purchases,
        ),
      ],
      [
        "Direct Farmer Deliveries",
        String(
          operations
            .direct_farmer_deliveries,
        ),
      ],
      [
        "Agent Collections",
        String(
          operations
            .agent_collections,
        ),
      ],
      [
        "Field Weighings",
        String(
          operations
            .field_weighings,
        ),
      ],
      [
        "Collection Trips",
        String(
          operations
            .collection_trips,
        ),
      ],
      [
        "Factory Receptions",
        String(
          operations
            .factory_receptions,
        ),
      ],
      [
        "Coffee Lots",
        String(
          operations
            .coffee_lots,
        ),
      ],
      [
        "Store Inventories",
        String(
          operations
            .store_inventories,
        ),
      ],
      [
        "Stock Movements",
        String(
          operations
            .stock_movements,
        ),
      ],
      [
        "Processing Batches",
        String(
          operations
            .processing_batches,
        ),
      ],
    ];
  }

  if (
    tab === "payroll" &&
    payroll
  ) {
    return [
      [
        "Metric",
        "Value",
      ],
      [
        "Total Records",
        String(
          payroll.total_records,
        ),
      ],
      [
        "Draft",
        String(
          payroll.draft_count,
        ),
      ],
      [
        "Processed",
        String(
          payroll.processed_count,
        ),
      ],
      [
        "Paid",
        String(
          payroll.paid_count,
        ),
      ],
      [
        "Cancelled",
        String(
          payroll.cancelled_count,
        ),
      ],
      [
        "Gross Salary",
        payroll.gross_salary,
      ],
      [
        "Deductions",
        payroll.deductions,
      ],
      [
        "Net Salary",
        payroll.net_salary,
      ],
      [
        "Paid Amount",
        payroll.paid_amount,
      ],
      [
        "Outstanding Amount",
        payroll.outstanding_amount,
      ],
    ];
  }

  if (
    tab === "approvals" &&
    approvals
  ) {
    return [
      [
        "Metric",
        "Value",
      ],
      [
        "Total",
        String(
          approvals.total,
        ),
      ],
      [
        "Pending",
        String(
          approvals.pending,
        ),
      ],
      [
        "Approved",
        String(
          approvals.approved,
        ),
      ],
      [
        "Rejected",
        String(
          approvals.rejected,
        ),
      ],
      [
        "Cancelled",
        String(
          approvals.cancelled,
        ),
      ],
      [
        "Pending Amount",
        approvals.pending_amount,
      ],
      [
        "Approved Amount",
        approvals.approved_amount,
      ],
      [
        "Applied Amount",
        approvals.applied_amount,
      ],
    ];
  }

  return [];
}

function errorMessage(
  error: unknown,
) {
  return error instanceof Error
    ? error.message
    : "Unable to load reports.";
}
