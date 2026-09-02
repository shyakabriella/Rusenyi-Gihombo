"use client";

import {
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileDown,
  Filter,
  LoaderCircle,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  X,
  XCircle,
} from "lucide-react";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  approveCashAllocation,
  cancelCashAllocation,
  createCashAllocation,
  getActiveAgentsForAllocation,
  getActiveCoffeeSeasonForAllocation,
  getCashAllocation,
  getCashAllocations,
  getCashAllocationSummary,
  updateCashAllocation,
  uploadCashAllocationProof,
} from "@/services/cash-allocation-service";

import type {
  ActiveCoffeeSeason,
  CashAllocation,
  CashAllocationAgent,
  CashAllocationPaymentMethod,
  CashAllocationStatus,
  CashAllocationSummary,
} from "@/types/cash-allocation";

function localDate() {
  const now = new Date();

  return [
    now.getFullYear(),
    String(
      now.getMonth() + 1,
    ).padStart(2, "0"),
    String(
      now.getDate(),
    ).padStart(2, "0"),
  ].join("-");
}

const initialSummary: CashAllocationSummary =
  {
    currency: "RWF",
    total_records: 0,
    draft_amount: "0.00",
    approved_amount: "0.00",
    cancelled_amount: "0.00",
  };

type AllocationForm = {
  agent_id: string;
  amount: string;

  payment_method:
    CashAllocationPaymentMethod;

  allocation_date: string;

  reference: string;
  purpose: string;
};

export default function CashAllocationManagement() {
  const [
    allocations,
    setAllocations,
  ] =
    useState<CashAllocation[]>(
      [],
    );

  const [
    agents,
    setAgents,
  ] =
    useState<
      CashAllocationAgent[]
    >([]);

  const [
    season,
    setSeason,
  ] =
    useState<ActiveCoffeeSeason | null>(
      null,
    );

  const [
    summary,
    setSummary,
  ] =
    useState<CashAllocationSummary>(
      initialSummary,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  const [
    page,
    setPage,
  ] =
    useState(1);

  const [
    lastPage,
    setLastPage,
  ] =
    useState(1);

  const [
    total,
    setTotal,
  ] =
    useState(0);

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    status,
    setStatus,
  ] =
    useState("");

  const [
    agentFilter,
    setAgentFilter,
  ] =
    useState("");

  const [
    appliedSearch,
    setAppliedSearch,
  ] =
    useState("");

  const [
    appliedStatus,
    setAppliedStatus,
  ] =
    useState("");

  const [
    appliedAgent,
    setAppliedAgent,
  ] =
    useState("");

  const [
    modalOpen,
    setModalOpen,
  ] =
    useState(false);

  const [
    viewOpen,
    setViewOpen,
  ] =
    useState(false);

  const [
    viewing,
    setViewing,
  ] =
    useState<CashAllocation | null>(
      null,
    );

  const [
    editing,
    setEditing,
  ] =
    useState<CashAllocation | null>(
      null,
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    cancelModalOpen,
    setCancelModalOpen,
  ] =
    useState(false);

  const [
    cancellingAllocation,
    setCancellingAllocation,
  ] =
    useState<CashAllocation | null>(
      null,
    );

  const [
    cancellationReason,
    setCancellationReason,
  ] =
    useState("");

  const [
    cancelling,
    setCancelling,
  ] =
    useState(false);

  const [
    form,
    setForm,
  ] =
    useState<AllocationForm>({
      agent_id: "",
      amount: "",

      payment_method:
        "cash",

      allocation_date:
        localDate(),

      reference: "",
      purpose: "",
    });

  const [
    paymentProof,
    setPaymentProof,
  ] =
    useState<File | null>(
      null,
    );

  const loadData =
    useCallback(
      async () => {
        setLoading(true);

        try {
          const [
            result,
            summaryResult,
          ] =
            await Promise.all([
              getCashAllocations({
                search:
                  appliedSearch ||
                  undefined,

                status:
                  appliedStatus
                    ? (
                        appliedStatus as CashAllocationStatus
                      )
                    : undefined,

                agent_id:
                  appliedAgent
                    ? Number(
                        appliedAgent,
                      )
                    : undefined,

                page,
                per_page: 10,
              }),

              getCashAllocationSummary(),
            ]);

          setAllocations(
            result.items,
          );

          setTotal(
            result.pagination.total,
          );

          setLastPage(
            Math.max(
              1,
              result.pagination
                .last_page,
            ),
          );

          setSummary(
            summaryResult,
          );
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load cash allocations.",
          );
        } finally {
          setLoading(false);
        }
      },
      [
        appliedSearch,
        appliedStatus,
        appliedAgent,
        page,
      ],
    );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    async function loadLookupData() {
      try {
        const [
          activeAgents,
          activeSeason,
        ] =
          await Promise.all([
            getActiveAgentsForAllocation(),

            getActiveCoffeeSeasonForAllocation(),
          ]);

        setAgents(
          activeAgents,
        );

        setSeason(
          activeSeason,
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load reference information.",
        );
      }
    }

    void loadLookupData();
  }, []);

  function openCreate() {
    setError("");
    setSuccess("");

    if (!season) {
      setError(
        "Activate a Coffee Season before creating an allocation.",
      );

      return;
    }

    setEditing(null);

    setPaymentProof(
      null,
    );

    setForm({
      agent_id: "",
      amount: "",

      payment_method:
        "cash",

      allocation_date:
        localDate(),

      reference: "",
      purpose: "",
    });

    setModalOpen(true);
  }

  function openEdit(
    allocation: CashAllocation,
  ) {
    if (
      allocation.status !==
      "draft"
    ) {
      return;
    }

    setEditing(
      allocation,
    );

    setPaymentProof(
      null,
    );

    setForm({
      agent_id:
        String(
          allocation.agent_id,
        ),

      amount:
        String(
          allocation.amount,
        ),

      payment_method:
        allocation.payment_method ??
        "cash",

      allocation_date:
        allocation.allocation_date,

      reference:
        allocation.reference ??
        "",

      purpose:
        allocation.purpose ??
        "",
    });

    setModalOpen(true);
  }

  async function submit(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (
      !season ||
      !form.agent_id
    ) {
      setError(
        "Coffee Season and Agent are required.",
      );

      return;
    }

    const amount =
      Number(form.amount);

    if (
      !Number.isFinite(
        amount,
      ) ||
      amount <= 0
    ) {
      setError(
        "Amount must be greater than zero.",
      );

      return;
    }

    if (
      (
        form.payment_method ===
          "mobile_money" ||
        form.payment_method ===
          "bank_transfer"
      ) &&
      !form.reference.trim()
    ) {
      setError(
        "Payment Reference is required for Mobile Money or Bank Transfer.",
      );

      return;
    }

    if (
      !editing &&
      !paymentProof
    ) {
      setError(
        "Payment Proof is required before creating the allocation.",
      );

      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        coffee_season_id:
          season.id,

        agent_id:
          Number(
            form.agent_id,
          ),

        amount,

        payment_method:
          form.payment_method,

        allocation_date:
          form.allocation_date,

        reference:
          form.reference.trim() ||
          null,

        purpose:
          form.purpose.trim() ||
          null,
      };

      let savedAllocation:
        CashAllocation;

      if (editing) {
        savedAllocation =
          await updateCashAllocation(
            editing.id,
            payload,
          );
      } else {
        savedAllocation =
          await createCashAllocation(
            payload,
          );
      }

      if (paymentProof) {
        try {
          savedAllocation =
            await uploadCashAllocationProof(
              savedAllocation.id,
              paymentProof,
            );
        } catch (proofError) {
          setModalOpen(
            false,
          );

          setEditing(
            null,
          );

          setPaymentProof(
            null,
          );

          setError(
            proofError instanceof
              Error
              ? `Allocation was saved as Draft, but payment proof upload failed: ${proofError.message}`
              : "Allocation was saved as Draft, but payment proof upload failed.",
          );

          await loadData();

          return;
        }
      }

      setSuccess(
        editing
          ? "Cash allocation updated successfully."
          : "Cash allocation and payment proof saved successfully.",
      );

      setModalOpen(false);

      setEditing(
        null,
      );

      setPaymentProof(
        null,
      );

      await loadData();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save cash allocation.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function openView(
    allocation: CashAllocation,
  ) {
    setViewOpen(true);
    setViewing(allocation);

    try {
      setViewing(
        await getCashAllocation(
          allocation.id,
        ),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load allocation.",
      );
    }
  }

  async function approve(
    allocation: CashAllocation,
  ) {
    if (
      !allocation
        .payment_proof
        ?.exists
    ) {
      setError(
        "Payment Proof is required before this allocation can be approved.",
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Approve ${allocation.allocation_code} for ${formatMoney(allocation.amount)}?`,
      );

    if (!confirmed) {
      return;
    }

    try {
      await approveCashAllocation(
        allocation.id,
      );

      setSuccess(
        "Cash allocation approved successfully.",
      );

      await loadData();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to approve allocation.",
      );
    }
  }

  function openCancelModal(
    allocation: CashAllocation,
  ) {
    setError("");
    setSuccess("");

    setCancellingAllocation(
      allocation,
    );

    setCancellationReason(
      "",
    );

    setCancelModalOpen(
      true,
    );
  }

  function closeCancelModal() {
    if (cancelling) {
      return;
    }

    setCancelModalOpen(
      false,
    );

    setCancellingAllocation(
      null,
    );

    setCancellationReason(
      "",
    );
  }

  async function confirmCancellation() {
    if (!cancellingAllocation) {
      return;
    }

    const reason =
      cancellationReason.trim();

    if (reason.length < 3) {
      setError(
        "Cancellation reason must contain at least 3 characters.",
      );

      return;
    }

    setCancelling(true);
    setError("");

    try {
      await cancelCashAllocation(
        cancellingAllocation.id,
        reason,
      );

      setSuccess(
        "Cash allocation cancelled successfully.",
      );

      setCancelModalOpen(
        false,
      );

      setCancellingAllocation(
        null,
      );

      setCancellationReason(
        "",
      );

      await loadData();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to cancel allocation.",
      );
    } finally {
      setCancelling(false);
    }
  }

  function applyFilters() {
    setAppliedSearch(
      search.trim(),
    );

    setAppliedStatus(
      status,
    );

    setAppliedAgent(
      agentFilter,
    );

    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setStatus("");
    setAgentFilter("");

    setAppliedSearch("");
    setAppliedStatus("");
    setAppliedAgent("");

    setPage(1);
  }

  function exportCsv() {
    const rows = [
      [
        "Allocation Code",
        "Agent",
        "Agent Code",
        "Amount",
        "Currency",
        "Date",
        "Reference",
        "Status",
      ],

      ...allocations.map(
        (item) => [
          item.allocation_code,

          item.agent?.user
            ?.name ?? "",

          item.agent
            ?.agent_code ?? "",

          item.amount,

          item.currency,

          item.allocation_date,

          item.reference ??
            "",

          item.status,
        ],
      ),
    ];

    const csv =
      rows
        .map(
          (row) =>
            row
              .map(
                (value) =>
                  `"${String(
                    value,
                  ).replaceAll(
                    '"',
                    '""',
                  )}"`,
              )
              .join(","),
        )
        .join("\n");

    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8",
        },
      );

    const url =
      URL.createObjectURL(
        blob,
      );

    const anchor =
      document.createElement(
        "a",
      );

    anchor.href = url;
    anchor.download =
      "cash-allocations.csv";

    document.body.appendChild(
      anchor,
    );

    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(
      url,
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">
            Cash Allocations
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-600">
            Allocate coffee purchasing money to field agents.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white"
        >
          <Plus size={17} />

          New Allocation
        </button>
      </div>

      <section className="rounded-xl border border-[#e5ded4] bg-[#fffaf2] p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-[#91651e]">
          Active Coffee Season
        </p>

        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="font-bold text-slate-950">
            {season
              ? `${season.name} · ${season.code}`
              : "No active Coffee Season"}
          </p>

          <span
            className={[
              "rounded-md px-3 py-1 text-xs font-bold",

              season
                ? "bg-emerald-50 text-emerald-800"
                : "bg-red-50 text-red-700",
            ].join(" ")}
          >
            {season
              ? "Active"
              : "Required"}
          </span>
        </div>
      </section>

      <section className="rounded-xl border border-[#e5ded4] bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-bold text-slate-700">
              Search
            </label>

            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value,
                  )
                }
                placeholder="Code, reference, agent..."
                className="h-11 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-[#075b38]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-slate-700">
              Status
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value,
                )
              }
              className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
            >
              <option value="">
                All Statuses
              </option>

              <option value="draft">
                Draft
              </option>

              <option value="approved">
                Approved
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-slate-700">
              Agent
            </label>

            <select
              value={
                agentFilter
              }
              onChange={(e) =>
                setAgentFilter(
                  e.target.value,
                )
              }
              className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
            >
              <option value="">
                All Agents
              </option>

              {agents.map(
                (agent) => (
                  <option
                    key={
                      agent.id
                    }
                    value={
                      agent.id
                    }
                  >
                    {
                      agent.agent_code
                    }
                    {" — "}
                    {
                      agent.user
                        ?.name
                    }
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={
              applyFilters
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#075b38] px-4 text-sm font-bold text-white"
          >
            <Filter size={16} />
            Filter
          </button>

          <button
            type="button"
            onClick={
              resetFilters
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-800"
          >
            <RotateCcw
              size={16}
            />
            Reset
          </button>

          <button
            type="button"
            onClick={
              exportCsv
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#dac7a9] px-4 text-sm font-bold text-[#075b38]"
          >
            <FileDown
              size={16}
            />
            Export
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {success}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Approved Cash"
          value={formatMoney(
            summary.approved_amount,
          )}
          icon={
            CheckCircle2
          }
        />

        <SummaryCard
          title="Draft Cash"
          value={formatMoney(
            summary.draft_amount,
          )}
          icon={
            Banknote
          }
        />

        <SummaryCard
          title="Cancelled Cash"
          value={formatMoney(
            summary.cancelled_amount,
          )}
          icon={
            XCircle
          }
        />

        <SummaryCard
          title="Records"
          value={String(
            summary.total_records,
          )}
          icon={
            Banknote
          }
        />
      </div>

      <section className="overflow-hidden rounded-xl border border-[#e5ded4] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-[#fcfbf9]">
              <tr className="border-b text-left text-xs font-bold text-slate-700">
                <th className="px-4 py-4">
                  Allocation
                </th>

                <th className="px-4 py-4">
                  Agent
                </th>

                <th className="px-4 py-4">
                  Date
                </th>

                <th className="px-4 py-4">
                  Amount
                </th>

                <th className="px-4 py-4">
                  Payment
                </th>

                <th className="px-4 py-4">
                  Payment Reference
                </th>

                <th className="px-4 py-4">
                  Proof
                </th>

                <th className="px-4 py-4">
                  Status
                </th>

                <th className="px-4 py-4 text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-20"
                  >
                    <LoaderCircle
                      size={30}
                      className="mx-auto animate-spin text-[#075b38]"
                    />
                  </td>
                </tr>
              ) : allocations.length ? (
                allocations.map(
                  (allocation) => (
                    <tr
                      key={
                        allocation.id
                      }
                      className="border-b border-slate-100 text-sm hover:bg-[#fdfbf8]"
                    >
                      <td className="px-4 py-4">
                        <p className="font-bold text-[#80570f]">
                          {
                            allocation.allocation_code
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {
                            allocation.coffee_season
                              ?.code ??
                            ""
                          }
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-900">
                          {
                            allocation.agent
                              ?.user
                              ?.name ??
                            "—"
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {
                            allocation.agent
                              ?.agent_code ??
                            "—"
                          }
                        </p>
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {
                          allocation.allocation_date
                        }
                      </td>

                      <td className="px-4 py-4 font-bold text-slate-950">
                        {formatMoney(
                          allocation.amount,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-semibold text-slate-800">
                          {formatPaymentMethod(
                            allocation.payment_method,
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {allocation.reference ||
                          "—"}
                      </td>

                      <td className="px-4 py-4">
                        {allocation
                          .payment_proof
                          ?.exists ? (
                          <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                            Uploaded
                          </span>
                        ) : (
                          <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
                            Missing
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          status={
                            allocation.status
                          }
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void openView(
                                allocation,
                              )
                            }
                            title="View"
                            className="flex h-8 w-9 items-center justify-center rounded-md border border-slate-300"
                          >
                            <Eye size={16} />
                          </button>

                          {allocation.status ===
                            "draft" && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  openEdit(
                                    allocation,
                                  )
                                }
                                title="Edit allocation"
                                className="flex h-8 items-center justify-center gap-1.5 rounded-md border border-slate-300 px-3 text-xs font-bold text-slate-700 transition hover:border-[#075b38] hover:bg-emerald-50 hover:text-[#075b38]"
                              >
                                <Pencil
                                  size={14}
                                />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  void approve(
                                    allocation,
                                  )
                                }
                                className="rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800"
                              >
                                Approve
                              </button>
                            </>
                          )}

                          {allocation.status !==
                            "cancelled" && (
                            <button
                              type="button"
                              onClick={() =>
                                openCancelModal(
                                  allocation,
                                )
                              }
                              className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="py-16 text-center text-sm text-slate-500"
                  >
                    No cash allocations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t px-5 py-4">
          <p className="text-sm text-slate-600">
            {total} allocations · Page{" "}
            <b>{page}</b> of{" "}
            <b>{lastPage}</b>
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={
                page <= 1
              }
              onClick={() =>
                setPage(
                  Math.max(
                    1,
                    page - 1,
                  ),
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-md border disabled:opacity-40"
            >
              <ChevronLeft
                size={17}
              />
            </button>

            <button
              type="button"
              disabled={
                page >=
                lastPage
              }
              onClick={() =>
                setPage(
                  page + 1,
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-md border disabled:opacity-40"
            >
              <ChevronRight
                size={17}
              />
            </button>
          </div>
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4">
          <form
            onSubmit={submit}
            className="w-full max-w-2xl rounded-xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-950">
                  {editing
                    ? "Edit Cash Allocation"
                    : "New Cash Allocation"}
                </h2>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  Allocation code is generated automatically.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setModalOpen(
                    false,
                  )
                }
                title="Close"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-400 bg-white text-slate-900 shadow-sm transition hover:border-slate-600 hover:bg-slate-100"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <div className="rounded-lg border bg-[#faf6ef] p-4 md:col-span-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-700">
                  Coffee Season
                </p>

                <p className="mt-2 font-bold text-slate-950">
                  {season
                    ? `${season.name} · ${season.code}`
                    : "No active season"}
                </p>
              </div>

              <Field
                label="Agent"
                required
              >
                <select
                  required
                  value={
                    form.agent_id
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,

                      agent_id:
                        e.target
                          .value,
                    })
                  }
                  className={
                    fieldClass
                  }
                >
                  <option value="">
                    Select Agent
                  </option>

                  {agents.map(
                    (agent) => (
                      <option
                        key={
                          agent.id
                        }
                        value={
                          agent.id
                        }
                      >
                        {
                          agent.agent_code
                        }
                        {" — "}
                        {
                          agent.user
                            ?.name
                        }
                      </option>
                    ),
                  )}
                </select>
              </Field>

              <Field
                label="Amount (RWF)"
                required
              >
                <input
                  required
                  type="number"
                  min="1"
                  value={
                    form.amount
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,

                      amount:
                        e.target
                          .value,
                    })
                  }
                  className={
                    fieldClass
                  }
                />
              </Field>

              <Field
                label="Payment Method"
                required
              >
                <select
                  required
                  value={
                    form.payment_method
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,

                      payment_method:
                        e.target
                          .value as
                          CashAllocationPaymentMethod,
                    })
                  }
                  className={
                    fieldClass
                  }
                >
                  <option value="cash">
                    Cash
                  </option>

                  <option value="mobile_money">
                    Mobile Money
                  </option>

                  <option value="bank_transfer">
                    Bank Transfer
                  </option>
                </select>
              </Field>

              <Field
                label="Allocation Date"
                required
              >
                <input
                  required
                  type="date"
                  value={
                    form.allocation_date
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,

                      allocation_date:
                        e.target
                          .value,
                    })
                  }
                  className={
                    fieldClass
                  }
                />
              </Field>

              <Field
                label="Payment Reference"
                required={
                  form.payment_method ===
                    "mobile_money" ||
                  form.payment_method ===
                    "bank_transfer"
                }
              >
                <input
                  value={
                    form.reference
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,

                      reference:
                        e.target
                          .value,
                    })
                  }
                  placeholder={
                    form.payment_method ===
                    "cash"
                      ? "Optional cash voucher/reference"
                      : form.payment_method ===
                          "mobile_money"
                        ? "Enter MoMo transaction reference"
                        : "Enter bank transaction reference"
                  }
                  className={
                    fieldClass
                  }
                />
              </Field>

              <Field
                label="Payment Proof"
                required={
                  !editing
                }
              >
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                    onChange={(e) => {
                      const file =
                        e.target
                          .files?.[0] ??
                        null;

                      if (
                        file &&
                        file.size >
                          5 *
                            1024 *
                            1024
                      ) {
                        setError(
                          "Payment proof cannot be larger than 5 MB.",
                        );

                        e.target.value =
                          "";

                        setPaymentProof(
                          null,
                        );

                        return;
                      }

                      setError("");

                      setPaymentProof(
                        file,
                      );
                    }}
                    className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 file:mr-4 file:rounded-md file:border-0 file:bg-[#f6e7d2] file:px-4 file:py-2 file:text-sm file:font-bold file:text-[#075b38]"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    JPG, PNG or PDF · Maximum 5 MB
                  </p>

                  {paymentProof && (
                    <p className="mt-2 text-sm font-semibold text-emerald-700">
                      Selected: {
                        paymentProof.name
                      }
                    </p>
                  )}

                  {!paymentProof &&
                    editing
                      ?.payment_proof
                      ?.exists && (
                      <p className="mt-2 text-sm font-semibold text-emerald-700">
                        Existing proof: {
                          editing
                            .payment_proof
                            .original_name ??
                          "Uploaded"
                        }
                      </p>
                    )}
              </Field>

              <div className="md:col-span-2">
                <Field label="Purpose">
                  <textarea
                    rows={3}
                    value={
                      form.purpose
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,

                        purpose:
                          e.target
                            .value,
                      })
                    }
                    className={
                      textareaClass
                    }
                  />
                </Field>
              </div>


            </div>

            <div className="flex justify-end gap-2 border-t px-6 py-4">
              <button
                type="button"
                onClick={() =>
                  setModalOpen(
                    false,
                  )
                }
                className="h-10 rounded-lg border border-slate-400 bg-white px-5 text-sm font-bold text-slate-900 shadow-sm transition hover:border-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="h-10 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editing
                    ? "Save Changes"
                    : "Create Allocation"}
              </button>
            </div>
          </form>
        </div>
      )}

      {cancelModalOpen &&
        cancellingAllocation && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-700">
                    <XCircle
                      size={22}
                    />
                  </div>

                  <h2 className="mt-4 text-xl font-extrabold text-slate-950">
                    Cancel Cash Allocation
                  </h2>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    Give a clear reason for cancelling this allocation.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeCancelModal
                  }
                  disabled={
                    cancelling
                  }
                  title="Close"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-400 bg-white text-slate-900 shadow-sm transition hover:border-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X
                    size={20}
                    strokeWidth={2.5}
                  />
                </button>
              </div>

              <div className="space-y-5 px-6 py-5">
                <div className="rounded-xl border border-[#e5ded4] bg-[#fffaf2] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                        Allocation
                      </p>

                      <p className="mt-1 text-base font-extrabold text-[#80570f]">
                        {
                          cancellingAllocation
                            .allocation_code
                        }
                      </p>
                    </div>

                    <p className="text-lg font-extrabold text-slate-950">
                      {formatMoney(
                        cancellingAllocation
                          .amount,
                      )}
                    </p>
                  </div>

                  <div className="mt-3 border-t border-[#eadfce] pt-3">
                    <p className="text-sm font-semibold text-slate-800">
                      {
                        cancellingAllocation
                          .agent
                          ?.user
                          ?.name ??
                        "Unknown agent"
                      }
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-600">
                      {
                        cancellingAllocation
                          .agent
                          ?.agent_code ??
                        "—"
                      }
                    </p>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-900">
                    Cancellation Reason
                    <span className="ml-1 text-red-600">
                      *
                    </span>
                  </label>

                  <textarea
                    autoFocus
                    rows={4}
                    value={
                      cancellationReason
                    }
                    onChange={(e) =>
                      setCancellationReason(
                        e.target.value,
                      )
                    }
                    placeholder="Explain why this cash allocation is being cancelled..."
                    className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-medium text-slate-600">
                      Minimum 3 characters
                    </p>

                    <p
                      className={[
                        "text-xs font-bold",
                        cancellationReason
                          .trim()
                          .length >= 3
                          ? "text-emerald-700"
                          : "text-slate-500",
                      ].join(" ")}
                    >
                      {
                        cancellationReason
                          .trim()
                          .length
                      }{" "}
                      characters
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-sm font-semibold text-amber-900">
                    This action keeps the allocation in the system for audit history, but changes its status to Cancelled.
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    closeCancelModal
                  }
                  disabled={
                    cancelling
                  }
                  className="h-11 rounded-lg border border-slate-400 bg-white px-5 text-sm font-bold text-slate-900 shadow-sm transition hover:border-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Keep Allocation
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void confirmCancellation()
                  }
                  disabled={
                    cancelling ||
                    cancellationReason
                      .trim()
                      .length < 3
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-red-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cancelling ? (
                    <>
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />

                      Cancelling...
                    </>
                  ) : (
                    <>
                      <XCircle
                        size={16}
                      />

                      Cancel Allocation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      {viewOpen &&
        viewing && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4">
            <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-950">
                    Allocation Details
                  </h2>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {
                      viewing.allocation_code
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setViewOpen(
                      false,
                    )
                  }
                  title="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-400 bg-white text-slate-900 shadow-sm transition hover:border-slate-600 hover:bg-slate-100"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-x-6 px-6 py-4 md:grid-cols-3">
                <Detail
                  label="Agent"
                  value={
                    viewing.agent
                      ?.user
                      ?.name ??
                    "—"
                  }
                />

                <Detail
                  label="Agent Code"
                  value={
                    viewing.agent
                      ?.agent_code ??
                    "—"
                  }
                />

                <Detail
                  label="Amount"
                  value={formatMoney(
                    viewing.amount,
                  )}
                />

                <Detail
                  label="Payment Method"
                  value={formatPaymentMethod(
                    viewing.payment_method,
                  )}
                />

                <Detail
                  label="Status"
                  value={
                    viewing.status
                  }
                />

                <Detail
                  label="Date"
                  value={
                    viewing.allocation_date
                  }
                />

                <Detail
                  label="Payment Reference"
                  value={
                    viewing.reference ||
                    "—"
                  }
                />

                <Detail
                  label="Created By"
                  value={
                    viewing.creator
                      ?.name ??
                    "—"
                  }
                />

                <Detail
                  label="Approved By"
                  value={
                    viewing.approver
                      ?.name ??
                    "—"
                  }
                />

                <div className="border-b border-slate-200 py-4 md:col-span-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                    Payment Proof
                  </p>

                  {viewing.payment_proof?.exists ? (
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <span className="text-sm font-semibold text-slate-900">
                        {viewing.payment_proof.original_name ?? "Proof uploaded"}
                      </span>

                      {viewing.payment_proof.url && (
                        <a
                          href={viewing.payment_proof.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-bold text-[#075b38] underline"
                        >
                          View Proof
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm font-semibold text-amber-700">
                      No payment proof uploaded.
                    </p>
                  )}
                </div>

                <div className="py-4 md:col-span-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                    Purpose
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {viewing.purpose || "No purpose provided."}
                  </p>
                </div>

                {viewing.status ===
                  "cancelled" && (
                  <div className="border-t border-red-200 bg-red-50 px-4 py-4 md:col-span-3">
                    <p className="text-xs font-bold uppercase text-red-700">
                      Cancellation Reason
                    </p>

                    <p className="mt-2 text-sm font-medium text-red-900">
                      {viewing.cancellation_reason || "—"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

const fieldClass =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#075b38]";

const textareaClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-[#075b38]";

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children:
    React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-900">
        {label}

        {required && (
          <span className="ml-1 text-red-600">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: typeof Banknote;
}) {
  return (
    <div className="rounded-xl border border-[#e5ded4] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f6e7d2] text-[#075b38]">
          <Icon size={20} />
        </div>

        <div>
          <p className="text-sm font-medium text-slate-600">
            {title}
          </p>

          <p className="mt-1 text-xl font-bold text-slate-950">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status:
    CashAllocationStatus;
}) {
  const style =
    status === "approved"
      ? "bg-emerald-50 text-emerald-800"
      : status ===
          "cancelled"
        ? "bg-red-50 text-red-700"
        : "bg-amber-50 text-amber-800";

  return (
    <span
      className={`rounded-md px-2.5 py-1 text-xs font-bold capitalize ${style}`}
    >
      {status}
    </span>
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
    <div className="border-b border-slate-200 py-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function formatPaymentMethod(
  value:
    | CashAllocationPaymentMethod
    | null
    | undefined,
) {
  if (
    value ===
    "mobile_money"
  ) {
    return "Mobile Money";
  }

  if (
    value ===
    "bank_transfer"
  ) {
    return "Bank Transfer";
  }

  if (
    value ===
    "cash"
  ) {
    return "Cash";
  }

  return "—";
}

function formatMoney(
  value:
    | number
    | string,
) {
  const amount =
    Number(value);

  return `${new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits:
        0,
    },
  ).format(
    Number.isFinite(amount)
      ? amount
      : 0,
  )} RWF`;
}
