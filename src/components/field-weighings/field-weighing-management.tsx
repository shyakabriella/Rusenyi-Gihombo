"use client";

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderCircle,
  RotateCcw,
  Search,
  Scale,
  X,
} from "lucide-react";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getFieldWeighing,
  getFieldWeighings,
  getFieldWeighingSummary,
} from "@/services/field-weighing-service";

import {
  getActiveAgentsForAllocation,
  getActiveCoffeeSeasonForAllocation,
} from "@/services/cash-allocation-service";

import type {
  ActiveCoffeeSeason,
  CashAllocationAgent,
} from "@/types/cash-allocation";

import type {
  FieldWeighing,
  FieldWeighingStatus,
  FieldWeighingSummary,
} from "@/types/field-weighing";

const emptySummary: FieldWeighingSummary = {
  total_records: 0,
  draft_records: 0,
  confirmed_records: 0,
  cancelled_records: 0,
  expected_quantity_kg: "0.00",
  field_weight_kg: "0.00",
  difference_kg: "0.00",
  shortage_quantity_kg: "0.00",
};

const fieldClass =
  "h-11 w-full rounded-lg border border-slate-400 bg-white px-3 text-sm font-medium text-slate-950 outline-none focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

export default function FieldWeighingManagement() {
  const [weighings, setWeighings] =
    useState<FieldWeighing[]>([]);

  const [summary, setSummary] =
    useState<FieldWeighingSummary>(
      emptySummary,
    );

  const [agents, setAgents] =
    useState<CashAllocationAgent[]>([]);

  const [season, setSeason] =
    useState<ActiveCoffeeSeason | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [agentFilter, setAgentFilter] =
    useState("");

  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");

  const [
    appliedSearch,
    setAppliedSearch,
  ] = useState("");

  const [
    appliedStatus,
    setAppliedStatus,
  ] = useState("");

  const [
    appliedAgent,
    setAppliedAgent,
  ] = useState("");

  const [
    appliedDateFrom,
    setAppliedDateFrom,
  ] = useState("");

  const [
    appliedDateTo,
    setAppliedDateTo,
  ] = useState("");

  const [page, setPage] =
    useState(1);

  const [lastPage, setLastPage] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [viewing, setViewing] =
    useState<FieldWeighing | null>(null);

  const loadData = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const [list, totals] =
          await Promise.all([
            getFieldWeighings({
              search:
                appliedSearch ||
                undefined,

              status: appliedStatus
                ? (
                    appliedStatus as FieldWeighingStatus
                  )
                : undefined,

              agent_id: appliedAgent
                ? Number(appliedAgent)
                : undefined,

              coffee_season_id:
                season?.id,

              date_from:
                appliedDateFrom ||
                undefined,

              date_to:
                appliedDateTo ||
                undefined,

              page,
              per_page: 15,
            }),

            getFieldWeighingSummary(
              season?.id,
            ),
          ]);

        setWeighings(list.items);
        setSummary(totals);

        setTotal(
          list.pagination.total,
        );

        setLastPage(
          Math.max(
            list.pagination.last_page,
            1,
          ),
        );
      } catch (error) {
        setError(
          errorMessage(error),
        );
      } finally {
        setLoading(false);
      }
    },
    [
      appliedSearch,
      appliedStatus,
      appliedAgent,
      appliedDateFrom,
      appliedDateTo,
      page,
      season?.id,
    ],
  );

  useEffect(() => {
    async function loadOptions() {
      try {
        const [
          activeAgents,
          activeSeason,
        ] = await Promise.all([
          getActiveAgentsForAllocation(),
          getActiveCoffeeSeasonForAllocation(),
        ]);

        setAgents(activeAgents);
        setSeason(activeSeason);
      } catch (error) {
        setError(
          errorMessage(error),
        );
      }
    }

    void loadOptions();
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function openView(
    weighing: FieldWeighing,
  ) {
    try {
      setViewing(
        await getFieldWeighing(
          weighing.id,
        ),
      );
    } catch (error) {
      setError(
        errorMessage(error),
      );
    }
  }

  function applyFilters() {
    setAppliedSearch(
      search.trim(),
    );

    setAppliedStatus(status);
    setAppliedAgent(agentFilter);
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);

    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setStatus("");
    setAgentFilter("");
    setDateFrom("");
    setDateTo("");

    setAppliedSearch("");
    setAppliedStatus("");
    setAppliedAgent("");
    setAppliedDateFrom("");
    setAppliedDateTo("");

    setPage(1);
  }

  return (
    <div className="space-y-5 text-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950">
            Field Weighing
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-700">
            Monitor coffee weighed in the
            field before transportation to
            the factory.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-[#fffaf2] px-4 py-3">
          <Scale
            size={20}
            className="text-[#80570f]"
          />

          <div>
            <p className="text-xs font-bold uppercase text-[#80570f]">
              Monitoring
            </p>

            <p className="text-sm font-bold text-slate-950">
              Balance Officer records
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-y border-[#d6c7af] bg-[#fffaf2] px-4 py-3">
        <div>
          <p className="text-xs font-bold uppercase text-[#80570f]">
            Active Coffee Season
          </p>

          <p className="mt-1 font-bold text-slate-950">
            {season
              ? `${season.name} · ${season.code}`
              : "No active coffee season"}
          </p>
        </div>

        {season && (
          <span className="rounded-md bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-900">
            Active
          </span>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Expected Coffee"
          value={`${number(
            summary.expected_quantity_kg,
          )} Kg`}
        />

        <Metric
          label="Field Weight"
          value={`${number(
            summary.field_weight_kg,
          )} Kg`}
          strong
        />

        <Metric
          label="Difference"
          value={`${signedNumber(
            summary.difference_kg,
          )} Kg`}
        />

        <Metric
          label="Shortage"
          value={`${number(
            summary.shortage_quantity_kg,
          )} Kg`}
          warning={
            Number(
              summary.shortage_quantity_kg,
            ) > 0
          }
        />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <CountCard
          label="Confirmed"
          value={summary.confirmed_records}
          type="confirmed"
        />

        <CountCard
          label="Draft"
          value={summary.draft_records}
          type="draft"
        />

        <CountCard
          label="Cancelled"
          value={summary.cancelled_records}
          type="cancelled"
        />
      </div>

      <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <Field label="Search">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="FW code, collection, agent..."
                className="h-11 w-full rounded-lg border border-slate-400 bg-white pl-9 pr-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-600 focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]"
              />
            </div>
          </Field>

          <Field label="Status">
            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value,
                )
              }
              className={fieldClass}
            >
              <option value="">
                All Statuses
              </option>

              <option value="draft">
                Draft
              </option>

              <option value="confirmed">
                Confirmed
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>
          </Field>

          <Field label="Agent">
            <select
              value={agentFilter}
              onChange={(event) =>
                setAgentFilter(
                  event.target.value,
                )
              }
              className={fieldClass}
            >
              <option value="">
                All Agents
              </option>

              {agents.map((agent) => (
                <option
                  key={agent.id}
                  value={agent.id}
                >
                  {agent.agent_code} —{" "}
                  {agent.user?.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="From">
            <input
              type="date"
              value={dateFrom}
              onChange={(event) =>
                setDateFrom(
                  event.target.value,
                )
              }
              className={fieldClass}
            />
          </Field>

          <Field label="To">
            <input
              type="date"
              value={dateTo}
              onChange={(event) =>
                setDateTo(
                  event.target.value,
                )
              }
              className={fieldClass}
            />
          </Field>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={applyFilters}
              className="h-11 rounded-lg bg-[#075b38] px-4 text-sm font-bold text-white hover:bg-[#064a2f]"
            >
              Filter
            </button>

            <button
              type="button"
              onClick={resetFilters}
              className="flex h-11 items-center gap-2 rounded-lg border border-slate-400 bg-white px-3 text-sm font-bold text-slate-900 hover:bg-slate-100"
            >
              <RotateCcw size={15} />
              Reset
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px]">
            <thead className="bg-[#f6f1e8]">
              <tr className="border-b border-slate-300 text-left text-xs font-extrabold uppercase text-slate-800">
                <th className="px-4 py-4">
                  Weighing
                </th>

                <th className="px-4 py-4">
                  Collection
                </th>

                <th className="px-4 py-4">
                  Agent
                </th>

                <th className="px-4 py-4">
                  Balance Officer
                </th>

                <th className="px-4 py-4">
                  Expected
                </th>

                <th className="px-4 py-4">
                  Field
                </th>

                <th className="px-4 py-4">
                  Difference
                </th>

                <th className="px-4 py-4">
                  Bags
                </th>

                <th className="px-4 py-4">
                  Status
                </th>

                <th className="px-4 py-4 text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={10}
                    className="py-20"
                  >
                    <LoaderCircle
                      size={30}
                      className="mx-auto animate-spin text-[#075b38]"
                    />
                  </td>
                </tr>
              ) : weighings.length ? (
                weighings.map(
                  (weighing) => (
                    <tr
                      key={weighing.id}
                      className="border-b border-slate-200 text-sm text-slate-900 hover:bg-[#fffdf8]"
                    >
                      <td className="px-4 py-4">
                        <p className="font-extrabold text-[#80570f]">
                          {
                            weighing.weighing_code
                          }
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-700">
                          {formatDateTime(
                            weighing.weighed_at,
                          )}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-950">
                          {weighing
                            .agent_collection
                            ?.collection_code ??
                            "—"}
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-700">
                          {weighing
                            .collection_point
                            ?.name ?? "—"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-950">
                          {weighing.agent
                            ?.user?.name ??
                            "—"}
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-700">
                          {weighing.agent
                            ?.agent_code ??
                            "—"}
                        </p>
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-950">
                        {weighing
                          .balance_officer
                          ?.name ?? "—"}
                      </td>

                      <td className="px-4 py-4 font-semibold">
                        {number(
                          weighing.expected_quantity_kg,
                        )}{" "}
                        Kg
                      </td>

                      <td className="px-4 py-4 font-extrabold text-slate-950">
                        {number(
                          weighing.field_weight_kg,
                        )}{" "}
                        Kg
                      </td>

                      <td className="px-4 py-4">
                        <Difference
                          value={
                            weighing.difference_kg
                          }
                          percentage={
                            weighing.difference_percentage
                          }
                        />
                      </td>

                      <td className="px-4 py-4 font-semibold">
                        {weighing.bag_count ??
                          "—"}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          status={
                            weighing.status
                          }
                        />
                      </td>

                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            void openView(
                              weighing,
                            )
                          }
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-400 bg-white px-3 text-xs font-bold text-slate-900 hover:bg-slate-100"
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="py-16 text-center text-sm font-medium text-slate-700"
                  >
                    No field weighings
                    found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-300 bg-white px-4 py-4">
          <p className="text-sm font-medium text-slate-700">
            {total} weighings · Page{" "}
            <b className="text-slate-950">
              {page}
            </b>{" "}
            of{" "}
            <b className="text-slate-950">
              {lastPage}
            </b>
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() =>
                setPage(
                  Math.max(
                    1,
                    page - 1,
                  ),
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-400 bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>

            <button
              type="button"
              disabled={
                page >= lastPage
              }
              onClick={() =>
                setPage(page + 1)
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-400 bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {viewing && (
        <Modal>
          <div className="w-full max-w-4xl rounded-xl bg-white shadow-2xl">
            <ModalHeader
              title={viewing.weighing_code}
              close={() =>
                setViewing(null)
              }
            />

            <div className="grid gap-x-6 px-6 py-3 md:grid-cols-3">
              <Detail
                label="Agent Collection"
                value={
                  viewing
                    .agent_collection
                    ?.collection_code ??
                  "—"
                }
              />

              <Detail
                label="Agent"
                value={
                  viewing.agent
                    ?.user?.name ??
                  "—"
                }
              />

              <Detail
                label="Balance Officer"
                value={
                  viewing
                    .balance_officer
                    ?.name ?? "—"
                }
              />

              <Detail
                label="Collection Point"
                value={
                  viewing
                    .collection_point
                    ?.name ?? "—"
                }
              />

              <Detail
                label="Expected Quantity"
                value={`${number(
                  viewing.expected_quantity_kg,
                )} Kg`}
              />

              <Detail
                label="Field Weight"
                value={`${number(
                  viewing.field_weight_kg,
                )} Kg`}
              />

              <Detail
                label="Difference"
                value={`${signedNumber(
                  viewing.difference_kg,
                )} Kg`}
              />

              <Detail
                label="Difference %"
                value={`${signedNumber(
                  viewing.difference_percentage,
                )}%`}
              />

              <Detail
                label="Bag Count"
                value={
                  viewing.bag_count
                    ? String(
                        viewing.bag_count,
                      )
                    : "—"
                }
              />

              <Detail
                label="Status"
                value={capitalize(
                  viewing.status,
                )}
              />

              <Detail
                label="Weighed At"
                value={formatDateTime(
                  viewing.weighed_at,
                )}
              />

              <Detail
                label="Confirmed By"
                value={
                  viewing.confirmer
                    ?.name ?? "—"
                }
              />

              <div className="border-b border-slate-300 py-4 md:col-span-3">
                <p className="text-xs font-extrabold uppercase text-slate-700">
                  Notes
                </p>

                <p className="mt-2 text-sm font-medium text-slate-950">
                  {viewing.notes ||
                    "No notes provided."}
                </p>
              </div>

              {viewing.cancellation_reason && (
                <div className="my-3 rounded-lg border border-red-300 bg-red-50 p-4 md:col-span-3">
                  <p className="text-xs font-extrabold uppercase text-red-800">
                    Cancellation Reason
                  </p>

                  <p className="mt-2 text-sm font-semibold text-red-950">
                    {
                      viewing.cancellation_reason
                    }
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-300 px-6 py-4">
              <button
                type="button"
                onClick={() =>
                  setViewing(null)
                }
                className="h-10 rounded-lg border border-slate-400 bg-white px-5 text-sm font-bold text-slate-900 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  strong = false,
  warning = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
      <p className="text-xs font-extrabold uppercase text-slate-700">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-extrabold ${
          warning
            ? "text-red-700"
            : strong
              ? "text-[#075b38]"
              : "text-slate-950"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function CountCard({
  label,
  value,
  type,
}: {
  label: string;
  value: number;
  type:
    | "confirmed"
    | "draft"
    | "cancelled";
}) {
  const style =
    type === "confirmed"
      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
      : type === "cancelled"
        ? "border-red-300 bg-red-50 text-red-900"
        : "border-amber-300 bg-amber-50 text-amber-900";

  return (
    <div
      className={`rounded-xl border p-4 ${style}`}
    >
      <p className="text-xs font-extrabold uppercase">
        {label}
      </p>

      <p className="mt-1 text-2xl font-extrabold">
        {value}
      </p>
    </div>
  );
}

function Difference({
  value,
  percentage,
}: {
  value: string;
  percentage: string;
}) {
  const amount = Number(value);

  const style =
    amount < 0
      ? "bg-red-50 text-red-800"
      : amount > 0
        ? "bg-amber-50 text-amber-900"
        : "bg-emerald-50 text-emerald-900";

  return (
    <div>
      <span
        className={`rounded-md px-2 py-1 text-xs font-extrabold ${style}`}
      >
        {signedNumber(value)} Kg
      </span>

      <p className="mt-1 text-xs font-semibold text-slate-700">
        {signedNumber(
          percentage,
        )}
        %
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: FieldWeighingStatus;
}) {
  const style =
    status === "confirmed"
      ? "bg-emerald-100 text-emerald-900"
      : status === "cancelled"
        ? "bg-red-100 text-red-900"
        : "bg-amber-100 text-amber-900";

  return (
    <span
      className={`rounded-md px-2.5 py-1 text-xs font-extrabold capitalize ${style}`}
    >
      {status}
    </span>
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
      <label className="mb-2 block text-sm font-bold text-slate-900">
        {label}
      </label>

      {children}
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-slate-300 py-4">
      <p className="text-xs font-extrabold uppercase text-slate-700">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function Modal({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      {children}
    </div>
  );
}

function ModalHeader({
  title,
  close,
}: {
  title: string;
  close: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-300 px-6 py-4">
      <h2 className="text-xl font-extrabold text-slate-950">
        {title}
      </h2>

      <button
        type="button"
        onClick={close}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-400 bg-white text-slate-900 hover:bg-slate-100"
      >
        <X size={18} />
      </button>
    </div>
  );
}

function number(
  value: string | number,
) {
  const parsed = Number(value);

  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 2,
    },
  ).format(
    Number.isFinite(parsed)
      ? parsed
      : 0,
  );
}

function signedNumber(
  value: string | number,
) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return "0";
  }

  if (parsed > 0) {
    return `+${number(parsed)}`;
  }

  return number(parsed);
}

function capitalize(
  value: string,
) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatDateTime(
  value: string,
) {
  const date = new Date(value);

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

function errorMessage(
  error: unknown,
) {
  return error instanceof Error
    ? error.message
    : "Something went wrong.";
}
