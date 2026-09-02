"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  Download,
  Eye,
  FileClock,
  RefreshCw,
  Search,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";

import {
  useCurrentUser,
} from "@/components/auth/current-user-context";

import {
  getAuditLog,
  getAuditLogs,
  getAuditSummary,
} from "@/services/audit-log-service";

import type {
  AuditFilters,
  AuditLog,
  AuditSummary,
} from "@/types/audit-log";

const moduleOptions = [
  ["approval_request", "Approvals"],
  ["payroll", "Payroll"],
  ["expense", "Expenses"],
  [
    "petty_cash_transaction",
    "Petty Cash",
  ],
  [
    "coffee_purchase",
    "Coffee Purchases",
  ],
  [
    "direct_farmer_delivery",
    "Direct Farmer Deliveries",
  ],
  [
    "agent_collection",
    "Agent Collections",
  ],
  [
    "field_weighing",
    "Field Weighing",
  ],
  [
    "collection_trip",
    "Collection Trips",
  ],
  [
    "factory_reception",
    "Factory Reception",
  ],
  ["coffee_lot", "Coffee Lots"],
  [
    "store_inventory",
    "Store Inventory",
  ],
  [
    "stock_movement",
    "Stock Movements",
  ],
  [
    "processing_batch",
    "Processing",
  ],
] as const;

function moduleLabel(
  module: string,
) {
  const match =
    moduleOptions.find(
      ([value]) =>
        value === module,
    );

  if (match) {
    return match[1];
  }

  return module
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
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

function valueText(
  value: unknown,
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  if (
    typeof value === "object"
  ) {
    return JSON.stringify(
      value,
      null,
      2,
    );
  }

  return String(value);
}

function ActionBadge({
  action,
}: {
  action: string;
}) {
  const classes =
    action === "created"
      ? "bg-emerald-50 text-emerald-700"
      : action === "updated"
        ? "bg-amber-50 text-amber-700"
        : action === "deleted"
          ? "bg-rose-50 text-rose-700"
          : "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${classes}`}
    >
      {action}
    </span>
  );
}

function MetricCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#eadfce] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {value.toLocaleString()}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f7f0e4] text-[#075b38]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ChangeTable({
  audit,
}: {
  audit: AuditLog;
}) {
  const keys =
    useMemo(() => {
      const oldKeys =
        Object.keys(
          audit.old_values ?? {},
        );

      const newKeys =
        Object.keys(
          audit.new_values ?? {},
        );

      return Array.from(
        new Set([
          ...oldKeys,
          ...newKeys,
        ]),
      );
    }, [
      audit.old_values,
      audit.new_values,
    ]);

  if (!keys.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
        No before/after values were
        recorded for this action.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#faf7f1] text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">
                Field
              </th>

              <th className="px-4 py-3">
                Before
              </th>

              <th className="px-4 py-3">
                After
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {keys.map((key) => (
              <tr key={key}>
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">
                  {key
                    .replaceAll(
                      "_",
                      " ",
                    )
                    .replace(
                      /\b\w/g,
                      (letter) =>
                        letter.toUpperCase(),
                    )}
                </td>

                <td className="max-w-[320px] px-4 py-3 align-top text-slate-600">
                  <pre className="whitespace-pre-wrap break-words font-sans text-xs">
                    {valueText(
                      audit.old_values?.[
                        key
                      ],
                    )}
                  </pre>
                </td>

                <td className="max-w-[320px] px-4 py-3 align-top text-slate-900">
                  <pre className="whitespace-pre-wrap break-words font-sans text-xs">
                    {valueText(
                      audit.new_values?.[
                        key
                      ],
                    )}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AuditTrailManagement() {
  const {
    user,
    loading: userLoading,
  } = useCurrentUser();

  const [logs, setLogs] =
    useState<AuditLog[]>([]);

  const [summary, setSummary] =
    useState<AuditSummary>({
      total_logs: 0,
      created_actions: 0,
      updated_actions: 0,
      deleted_actions: 0,
      today: 0,
      active_users: 0,
    });

  const [pagination, setPagination] =
    useState({
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 0,
    });

  const [search, setSearch] =
    useState("");

  const [module, setModule] =
    useState("");

  const [action, setAction] =
    useState("");

  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");

  const [filters, setFilters] =
    useState<AuditFilters>({});

  const [page, setPage] =
    useState(1);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    selectedAudit,
    setSelectedAudit,
  ] =
    useState<AuditLog | null>(
      null,
    );

  const [
    detailLoading,
    setDetailLoading,
  ] =
    useState(false);

  const loadAuditTrail =
    useCallback(async () => {
      if (
        !user ||
        user.role !== "admin"
      ) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [
          listResult,
          summaryResult,
        ] =
          await Promise.all([
            getAuditLogs({
              ...filters,
              page,
              per_page: 20,
            }),
            getAuditSummary(),
          ]);

        setLogs(
          listResult.items ?? [],
        );

        setPagination(
          listResult.pagination,
        );

        setSummary(
          summaryResult,
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load Audit Trail.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      user,
      filters,
      page,
    ]);

  useEffect(() => {
    loadAuditTrail();
  }, [loadAuditTrail]);

  function applyFilters(
    event?: FormEvent,
  ) {
    event?.preventDefault();

    setPage(1);

    setFilters({
      search:
        search.trim() ||
        undefined,

      module:
        module ||
        undefined,

      action:
        action ||
        undefined,

      date_from:
        dateFrom ||
        undefined,

      date_to:
        dateTo ||
        undefined,
    });
  }

  function resetFilters() {
    setSearch("");
    setModule("");
    setAction("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
    setFilters({});
  }

  async function openDetails(
    audit: AuditLog,
  ) {
    setSelectedAudit(audit);
    setDetailLoading(true);

    try {
      const detail =
        await getAuditLog(
          audit.id,
        );

      setSelectedAudit(detail);
    } catch {
      // The list record already contains
      // enough information to display.
    } finally {
      setDetailLoading(false);
    }
  }

  function exportCsv() {
    if (!logs.length) {
      return;
    }

    const header = [
      "Audit Code",
      "Date",
      "User",
      "Role",
      "Action",
      "Module",
      "Record Code",
      "Description",
      "Method",
      "Path",
      "IP Address",
    ];

    const rows =
      logs.map((audit) => [
        audit.audit_code,
        audit.created_at,
        audit.user_name ?? "",
        audit.user_role ?? "",
        audit.action,
        moduleLabel(
          audit.module,
        ),
        audit.auditable_code ??
          String(
            audit.auditable_id,
          ),
        audit.description,
        audit.request_method ?? "",
        audit.request_path ?? "",
        audit.ip_address ?? "",
      ]);

    const csv =
      [header, ...rows]
        .map((row) =>
          row
            .map((value) => {
              const text =
                String(
                  value ?? "",
                ).replaceAll(
                  '"',
                  '""',
                );

              return `"${text}"`;
            })
            .join(","),
        )
        .join("\n");

    const blob =
      new Blob(
        [csv],
        {
          type: "text/csv;charset=utf-8",
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
      `audit-trail-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(
      link,
    );

    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  if (userLoading) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-[#eadfce] bg-white p-8 text-sm text-slate-500">
          Loading Audit Trail...
        </div>
      </div>
    );
  }

  if (
    !user ||
    user.role !== "admin"
  ) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
          <ShieldCheck
            size={32}
            className="text-amber-700"
          />

          <h2 className="mt-4 text-xl font-bold text-slate-950">
            Admin access required
          </h2>

          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Audit Trail contains
            system-wide activity and
            is available to Admin
            users only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8b7655]">
            System Security
          </p>

          <h2 className="mt-1 font-serif text-3xl font-bold text-slate-950">
            Audit Trail
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Review important system
            actions, users, record
            changes and request
            information.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={
              loadAuditTrail
            }
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#e5d9c7] bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-[#faf7f1]"
          >
            <RefreshCw
              size={17}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={exportCsv}
            disabled={!logs.length}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#075b38] px-4 text-sm font-semibold text-white transition hover:bg-[#064c30] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download
              size={17}
            />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Total Logs"
          value={
            summary.total_logs
          }
          icon={
            <FileClock
              size={20}
            />
          }
        />

        <MetricCard
          title="Today"
          value={summary.today}
          icon={
            <CalendarDays
              size={20}
            />
          }
        />

        <MetricCard
          title="Created"
          value={
            summary.created_actions
          }
          icon={
            <ShieldCheck
              size={20}
            />
          }
        />

        <MetricCard
          title="Updated"
          value={
            summary.updated_actions
          }
          icon={
            <RefreshCw
              size={20}
            />
          }
        />

        <MetricCard
          title="Active Users"
          value={
            summary.active_users
          }
          icon={
            <UsersRound
              size={20}
            />
          }
        />
      </div>

      <form
        onSubmit={applyFilters}
        className="rounded-2xl border border-[#eadfce] bg-white p-4 shadow-sm"
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <div className="relative xl:col-span-2">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search audit code, record, user..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#c7ad82]"
            />
          </div>

          <select
            value={module}
            onChange={(event) =>
              setModule(
                event.target.value,
              )
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#c7ad82]"
          >
            <option value="">
              All Modules
            </option>

            {moduleOptions.map(
              ([value, label]) => (
                <option
                  key={value}
                  value={value}
                >
                  {label}
                </option>
              ),
            )}
          </select>

          <select
            value={action}
            onChange={(event) =>
              setAction(
                event.target.value,
              )
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#c7ad82]"
          >
            <option value="">
              All Actions
            </option>
            <option value="created">
              Created
            </option>
            <option value="updated">
              Updated
            </option>
            <option value="deleted">
              Deleted
            </option>
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(event) =>
              setDateFrom(
                event.target.value,
              )
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#c7ad82]"
          />

          <input
            type="date"
            value={dateTo}
            onChange={(event) =>
              setDateTo(
                event.target.value,
              )
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#c7ad82]"
          />
        </div>

        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={resetFilters}
            className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Reset
          </button>

          <button
            type="submit"
            className="h-10 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Apply Filters
          </button>
        </div>
      </form>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-[#eadfce] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="font-bold text-slate-950">
              System Activity
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              {pagination.total.toLocaleString()}{" "}
              audit records
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1050px] w-full text-left text-sm">
            <thead className="bg-[#faf7f1] text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">
                  Audit
                </th>

                <th className="px-5 py-3">
                  User
                </th>

                <th className="px-5 py-3">
                  Module
                </th>

                <th className="px-5 py-3">
                  Action
                </th>

                <th className="px-5 py-3">
                  Record
                </th>

                <th className="px-5 py-3">
                  Date
                </th>

                <th className="px-5 py-3">
                  Request
                </th>

                <th className="px-5 py-3 text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    Loading audit
                    records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No audit records
                    found.
                  </td>
                </tr>
              ) : (
                logs.map(
                  (audit) => (
                    <tr
                      key={audit.id}
                      className="transition hover:bg-[#fdfbf7]"
                    >
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">
                          {
                            audit.audit_code
                          }
                        </p>

                        <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                          {
                            audit.description
                          }
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {audit.user_name ??
                            audit.user
                              ?.name ??
                            "System"}
                        </p>

                        <p className="mt-1 text-xs capitalize text-slate-500">
                          {audit.user_role ??
                            audit.user
                              ?.role ??
                            "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-700">
                        {moduleLabel(
                          audit.module,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <ActionBadge
                          action={
                            audit.action
                          }
                        />
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {audit.auditable_code ??
                            `#${audit.auditable_id}`}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {formatDateTime(
                          audit.created_at,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                          {audit.request_method ??
                            "—"}
                        </span>

                        <p className="mt-1 max-w-[160px] truncate text-xs text-slate-500">
                          {audit.ip_address ??
                            "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            openDetails(
                              audit,
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          <Eye
                            size={15}
                          />
                          View
                        </button>
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Page{" "}
            {
              pagination.current_page
            }{" "}
            of{" "}
            {Math.max(
              pagination.last_page,
              1,
            )}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={
                page <= 1 ||
                loading
              }
              onClick={() =>
                setPage((value) =>
                  Math.max(
                    1,
                    value - 1,
                  ),
                )
              }
              className="h-9 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={
                page >=
                  pagination.last_page ||
                loading
              }
              onClick={() =>
                setPage((value) =>
                  value + 1,
                )
              }
              className="h-9 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedAudit ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white px-6 py-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-950">
                    {
                      selectedAudit.audit_code
                    }
                  </h3>

                  <ActionBadge
                    action={
                      selectedAudit.action
                    }
                  />
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {
                    selectedAudit.description
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedAudit(
                    null,
                  )
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {detailLoading ? (
                <p className="text-sm text-slate-500">
                  Loading full
                  details...
                </p>
              ) : null}

              <div className="grid gap-4 rounded-xl bg-[#faf7f1] p-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    User
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {selectedAudit.user_name ??
                      selectedAudit
                        .user?.name ??
                      "System"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Role
                  </p>

                  <p className="mt-1 font-semibold capitalize text-slate-800">
                    {selectedAudit.user_role ??
                      selectedAudit
                        .user?.role ??
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Module
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {moduleLabel(
                      selectedAudit.module,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Record
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {selectedAudit.auditable_code ??
                      `#${selectedAudit.auditable_id}`}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="mb-3 font-bold text-slate-900">
                  Changes
                </h4>

                <ChangeTable
                  audit={
                    selectedAudit
                  }
                />
              </div>

              <div>
                <h4 className="mb-3 font-bold text-slate-900">
                  Request Information
                </h4>

                <div className="grid gap-4 rounded-xl border border-slate-200 p-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase text-slate-400">
                      Date
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {formatDateTime(
                        selectedAudit.created_at,
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-slate-400">
                      IP Address
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {selectedAudit.ip_address ??
                        "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-slate-400">
                      Method
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {selectedAudit.request_method ??
                        "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-slate-400">
                      Route Name
                    </p>

                    <p className="mt-1 break-all text-sm font-medium text-slate-800">
                      {selectedAudit.route_name ??
                        "—"}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-xs uppercase text-slate-400">
                      Request Path
                    </p>

                    <p className="mt-1 break-all text-sm font-medium text-slate-800">
                      {selectedAudit.request_path ??
                        "—"}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-xs uppercase text-slate-400">
                      User Agent
                    </p>

                    <p className="mt-1 break-all text-xs leading-5 text-slate-600">
                      {selectedAudit.user_agent ??
                        "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
