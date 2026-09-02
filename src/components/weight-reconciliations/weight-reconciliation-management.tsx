"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Gauge,
  LoaderCircle,
  Pencil,
  Plus,
  Scale,
  Search,
  X,
} from "lucide-react";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  cancelWeightReconciliation,
  createWeightReconciliation,
  getEligibleFactoryReceptions,
  getWeightReconciliation,
  getWeightReconciliationRole,
  getWeightReconciliations,
  getWeightReconciliationSummary,
  reconcileWeightReconciliation,
  updateWeightReconciliation,
} from "@/services/weight-reconciliation-service";

import type {
  DashboardRole,
  EligibleFactoryReception,
  WeightReconciliation,
  WeightReconciliationOutcome,
  WeightReconciliationStatus,
  WeightReconciliationSummary,
} from "@/types/weight-reconciliation";

const inputClass =
  "h-11 w-full rounded-lg border border-slate-400 bg-white px-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-600 focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

const textareaClass =
  "min-h-24 w-full rounded-lg border border-slate-400 bg-white px-3 py-2.5 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-600 focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

const emptySummary: WeightReconciliationSummary = {
  total_reconciliations: 0,
  draft_reconciliations: 0,
  reconciled_reconciliations: 0,
  within_tolerance: 0,
  shortages: 0,
  excesses: 0,
  net_difference_kg: "0.00",
  absolute_variance_kg: "0.00",
};

export default function WeightReconciliationManagement() {
  const [items, setItems] =
    useState<WeightReconciliation[]>([]);

  const [summary, setSummary] =
    useState<WeightReconciliationSummary>(
      emptySummary,
    );

  const [role, setRole] =
    useState<DashboardRole>("");

  const [eligible, setEligible] =
    useState<
      EligibleFactoryReception[]
    >([]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [outcome, setOutcome] =
    useState("");

  const [filters, setFilters] =
    useState({
      search: "",
      status: "",
      outcome: "",
    });

  const [page, setPage] =
    useState(1);

  const [lastPage, setLastPage] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [createOpen, setCreateOpen] =
    useState(false);

  const [viewing, setViewing] =
    useState<WeightReconciliation | null>(
      null,
    );

  const [editing, setEditing] =
    useState<WeightReconciliation | null>(
      null,
    );

  const [
    cancelTarget,
    setCancelTarget,
  ] =
    useState<WeightReconciliation | null>(
      null,
    );

  const [
    receptionId,
    setReceptionId,
  ] = useState("");

  const [
    tolerance,
    setTolerance,
  ] = useState("2");

  const [notes, setNotes] =
    useState("");

  const [
    cancellationReason,
    setCancellationReason,
  ] = useState("");

  const canManage =
    role === "admin";

  const selectedReception =
    useMemo(() => {
      return eligible.find(
        (item) =>
          item.id ===
          Number(receptionId),
      ) ?? null;
    }, [
      eligible,
      receptionId,
    ]);

  const load = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const [list, totals] =
          await Promise.all([
            getWeightReconciliations({
              search:
                filters.search ||
                undefined,

              status:
                filters.status
                  ? (
                      filters.status as WeightReconciliationStatus
                    )
                  : undefined,

              outcome:
                filters.outcome
                  ? (
                      filters.outcome as WeightReconciliationOutcome
                    )
                  : undefined,

              page,
              per_page: 15,
            }),

            getWeightReconciliationSummary(),
          ]);

        setItems(list.items);
        setSummary(totals);

        setTotal(
          list.pagination.total,
        );

        setLastPage(
          Math.max(
            list.pagination
              .last_page,
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
      filters,
      page,
    ],
  );

  useEffect(() => {
    async function prepare() {
      try {
        const currentRole =
          await getWeightReconciliationRole();

        setRole(currentRole);

        if (
          currentRole === "admin"
        ) {
          const receptions =
            await getEligibleFactoryReceptions();

          setEligible(receptions);
        }
      } catch (error) {
        setError(
          errorMessage(error),
        );
      }
    }

    void prepare();
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function refreshEligible() {
    if (!canManage) {
      return;
    }

    setEligible(
      await getEligibleFactoryReceptions(),
    );
  }

  function applyFilters() {
    setFilters({
      search:
        search.trim(),
      status,
      outcome,
    });

    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setStatus("");
    setOutcome("");

    setFilters({
      search: "",
      status: "",
      outcome: "",
    });

    setPage(1);
  }

  async function openCreate() {
    setError("");
    setSuccess("");

    try {
      await refreshEligible();

      setReceptionId("");
      setTolerance("2");
      setNotes("");

      setCreateOpen(true);
    } catch (error) {
      setError(
        errorMessage(error),
      );
    }
  }

  async function submitCreate() {
    if (!receptionId) {
      setError(
        "Select a confirmed Factory Reception.",
      );
      return;
    }

    const toleranceValue =
      Number(tolerance);

    if (
      !Number.isFinite(
        toleranceValue,
      ) ||
      toleranceValue < 0 ||
      toleranceValue > 100
    ) {
      setError(
        "Tolerance must be between 0 and 100.",
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      await createWeightReconciliation({
        factory_reception_id:
          Number(receptionId),

        tolerance_percentage:
          toleranceValue,

        notes:
          notes.trim() ||
          undefined,
      });

      setCreateOpen(false);

      setSuccess(
        "Weight reconciliation created successfully.",
      );

      await Promise.all([
        load(),
        refreshEligible(),
      ]);
    } catch (error) {
      setError(
        errorMessage(error),
      );
    } finally {
      setBusy(false);
    }
  }

  async function openView(
    item: WeightReconciliation,
  ) {
    try {
      const result =
        await getWeightReconciliation(
          item.id,
        );

      setViewing(result);
    } catch (error) {
      setError(
        errorMessage(error),
      );
    }
  }

  function openEdit(
    item: WeightReconciliation,
  ) {
    setEditing(item);

    setTolerance(
      item.tolerance_percentage,
    );

    setNotes(
      item.notes ?? "",
    );
  }

  async function submitEdit() {
    if (!editing) {
      return;
    }

    const toleranceValue =
      Number(tolerance);

    if (
      !Number.isFinite(
        toleranceValue,
      ) ||
      toleranceValue < 0 ||
      toleranceValue > 100
    ) {
      setError(
        "Tolerance must be between 0 and 100.",
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      await updateWeightReconciliation(
        editing.id,
        {
          tolerance_percentage:
            toleranceValue,

          notes:
            notes.trim() ||
            null,
        },
      );

      setEditing(null);

      setSuccess(
        "Weight reconciliation updated successfully.",
      );

      await load();
    } catch (error) {
      setError(
        errorMessage(error),
      );
    } finally {
      setBusy(false);
    }
  }

  async function reconcile(
    item: WeightReconciliation,
  ) {
    if (
      !window.confirm(
        `Reconcile ${item.reconciliation_code}?`,
      )
    ) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const result =
        await reconcileWeightReconciliation(
          item.id,
        );

      setSuccess(
        `${item.reconciliation_code} reconciled: ${label(
          result.outcome ??
            "within_tolerance",
        )}.`,
      );

      await load();
    } catch (error) {
      setError(
        errorMessage(error),
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitCancel() {
    if (!cancelTarget) {
      return;
    }

    if (
      cancellationReason
        .trim()
        .length < 3
    ) {
      setError(
        "Cancellation reason is required.",
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      await cancelWeightReconciliation(
        cancelTarget.id,
        cancellationReason.trim(),
      );

      setCancelTarget(null);
      setCancellationReason("");

      setSuccess(
        "Weight reconciliation cancelled successfully.",
      );

      await Promise.all([
        load(),
        refreshEligible(),
      ]);
    } catch (error) {
      setError(
        errorMessage(error),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5 text-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">
            Weight Reconciliation
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-700">
            Compare field and factory
            coffee weights and identify
            shortages, excesses and
            acceptable differences.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() =>
              void openCreate()
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white hover:bg-[#064a2f]"
          >
            <Plus size={17} />
            New Reconciliation
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Total Reconciliations"
          value={
            summary.total_reconciliations
          }
          icon={
            <Scale size={19} />
          }
        />

        <Metric
          title="Reconciled"
          value={
            summary.reconciled_reconciliations
          }
          icon={
            <CheckCircle2
              size={19}
            />
          }
          green
        />

        <Metric
          title="Net Difference"
          value={`${formatNumber(
            summary.net_difference_kg,
          )} Kg`}
          icon={
            <Gauge size={19} />
          }
        />

        <Metric
          title="Absolute Variance"
          value={`${formatNumber(
            summary.absolute_variance_kg,
          )} Kg`}
          icon={
            <AlertTriangle
              size={19}
            />
          }
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MiniMetric
          title="Within Tolerance"
          value={
            summary.within_tolerance
          }
        />

        <MiniMetric
          title="Shortages"
          value={
            summary.shortages
          }
        />

        <MiniMetric
          title="Excesses"
          value={
            summary.excesses
          }
        />

        <MiniMetric
          title="Draft"
          value={
            summary.draft_reconciliations
          }
        />
      </div>

      <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_190px_190px_auto_auto]">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              onKeyDown={(
                event,
              ) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  applyFilters();
                }
              }}
              placeholder="Search reconciliation, reception or agent..."
              className="h-11 w-full rounded-lg border border-slate-400 bg-white pl-9 pr-3 text-sm font-medium outline-none placeholder:text-slate-600 focus:border-[#075b38]"
            />
          </div>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value,
              )
            }
            className={inputClass}
          >
            <option value="">
              All Statuses
            </option>

            <option value="draft">
              Draft
            </option>

            <option value="reconciled">
              Reconciled
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>

          <select
            value={outcome}
            onChange={(event) =>
              setOutcome(
                event.target.value,
              )
            }
            className={inputClass}
          >
            <option value="">
              All Outcomes
            </option>

            <option value="within_tolerance">
              Within Tolerance
            </option>

            <option value="shortage">
              Shortage
            </option>

            <option value="excess">
              Excess
            </option>
          </select>

          <button
            type="button"
            onClick={
              applyFilters
            }
            className="h-11 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white"
          >
            Filter
          </button>

          <button
            type="button"
            onClick={
              resetFilters
            }
            className="h-11 rounded-lg border border-slate-400 bg-white px-5 text-sm font-bold hover:bg-slate-100"
          >
            Reset
          </button>
        </div>
      </div>

      {error && (
        <Notice
          text={error}
          error
        />
      )}

      {success && (
        <Notice
          text={success}
        />
      )}

      <section className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1350px]">
            <thead className="bg-[#f6f1e8]">
              <tr className="border-b border-slate-300 text-left text-xs font-extrabold uppercase text-slate-800">
                <th className="px-4 py-4">
                  Reconciliation
                </th>

                <th className="px-4 py-4">
                  Reception
                </th>

                <th className="px-4 py-4">
                  Agent
                </th>

                <th className="px-4 py-4">
                  Field Weight
                </th>

                <th className="px-4 py-4">
                  Factory Weight
                </th>

                <th className="px-4 py-4">
                  Difference
                </th>

                <th className="px-4 py-4">
                  Tolerance
                </th>

                <th className="px-4 py-4">
                  Outcome
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
                    colSpan={10}
                    className="py-20"
                  >
                    <LoaderCircle
                      size={30}
                      className="mx-auto animate-spin text-[#075b38]"
                    />
                  </td>
                </tr>
              ) : items.length ? (
                items.map(
                  (item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-200 text-sm hover:bg-[#fffdf8]"
                    >
                      <td className="px-4 py-4">
                        <p className="font-extrabold text-[#80570f]">
                          {
                            item.reconciliation_code
                          }
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-600">
                          {item.field_weighing
                            ?.weighing_code ??
                            `FW #${item.field_weighing_id}`}
                        </p>
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {item.factory_reception
                          ?.reception_code ??
                          `#${item.factory_reception_id}`}
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-bold">
                          {agentName(
                            item,
                          )}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {item.collection_point
                            ?.name ??
                            "—"}
                        </p>
                      </td>

                      <td className="px-4 py-4 font-extrabold">
                        {formatNumber(
                          item.field_weight_kg,
                        )}{" "}
                        Kg
                      </td>

                      <td className="px-4 py-4 font-extrabold">
                        {formatNumber(
                          item.factory_weight_kg,
                        )}{" "}
                        Kg
                      </td>

                      <td className="px-4 py-4">
                        <Difference
                          kg={
                            item.difference_kg
                          }
                          percentage={
                            item.difference_percentage
                          }
                        />
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {formatNumber(
                          item.tolerance_percentage,
                        )}
                        %
                      </td>

                      <td className="px-4 py-4">
                        <OutcomeBadge
                          outcome={
                            item.outcome
                          }
                        />
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          status={
                            item.status
                          }
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-2">
                          <IconButton
                            title="View"
                            onClick={() =>
                              void openView(
                                item,
                              )
                            }
                          >
                            <Eye
                              size={
                                15
                              }
                            />
                          </IconButton>

                          {canManage &&
                            item.status ===
                              "draft" && (
                              <>
                                <IconButton
                                  title="Edit"
                                  onClick={() =>
                                    openEdit(
                                      item,
                                    )
                                  }
                                >
                                  <Pencil
                                    size={
                                      15
                                    }
                                  />
                                </IconButton>

                                <button
                                  type="button"
                                  disabled={
                                    busy
                                  }
                                  onClick={() =>
                                    void reconcile(
                                      item,
                                    )
                                  }
                                  className="h-9 rounded-lg bg-[#075b38] px-3 text-xs font-bold text-white disabled:opacity-50"
                                >
                                  Reconcile
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setCancelTarget(
                                      item,
                                    );

                                    setCancellationReason(
                                      "",
                                    );
                                  }}
                                  className="h-9 rounded-lg border border-red-300 px-3 text-xs font-bold text-red-800 hover:bg-red-50"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                        </div>
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="py-16 text-center"
                  >
                    <Scale
                      size={38}
                      className="mx-auto text-slate-400"
                    />

                    <p className="mt-3 font-bold">
                      No weight
                      reconciliations
                      found.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          lastPage={lastPage}
          total={total}
          setPage={setPage}
        />
      </section>

      {createOpen && (
        <Modal>
          <ModalCard
            title="New Weight Reconciliation"
            subtitle="Select a confirmed Factory Reception. Weight differences are calculated by the backend."
            close={() =>
              setCreateOpen(
                false,
              )
            }
          >
            <Field label="Factory Reception">
              <select
                value={
                  receptionId
                }
                onChange={(
                  event,
                ) =>
                  setReceptionId(
                    event.target
                      .value,
                  )
                }
                className={
                  inputClass
                }
              >
                <option value="">
                  Select confirmed reception
                </option>

                {eligible.map(
                  (item) => (
                    <option
                      key={
                        item.id
                      }
                      value={
                        item.id
                      }
                    >
                      {
                        item.reception_code
                      }{" "}
                      —{" "}
                      {item.agent
                        ?.user
                        ?.name ??
                        "Agent"}{" "}
                      —{" "}
                      {formatNumber(
                        item.factory_weight_kg,
                      )}{" "}
                      Kg
                    </option>
                  ),
                )}
              </select>
            </Field>

            {selectedReception && (
              <div className="grid gap-3 rounded-lg border border-[#d9c9ae] bg-[#fffaf2] p-4 sm:grid-cols-2 lg:grid-cols-4">
                <Info
                  title="Agent"
                  value={
                    selectedReception
                      .agent?.user
                      ?.name ??
                    "—"
                  }
                />

                <Info
                  title="Field Weight"
                  value={`${formatNumber(
                    selectedReception.field_weight_kg,
                  )} Kg`}
                />

                <Info
                  title="Factory Weight"
                  value={`${formatNumber(
                    selectedReception.factory_weight_kg,
                  )} Kg`}
                />

                <Info
                  title="Difference"
                  value={`${signed(
                    selectedReception.difference_kg,
                  )} Kg`}
                />
              </div>
            )}

            <Field label="Tolerance Percentage">
              <div className="relative max-w-xs">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={
                    tolerance
                  }
                  onChange={(
                    event,
                  ) =>
                    setTolerance(
                      event.target
                        .value,
                    )
                  }
                  className={
                    inputClass
                  }
                />

                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-600">
                  %
                </span>
              </div>

              <p className="mt-2 text-xs font-medium text-slate-600">
                Default tolerance is
                2%.
              </p>
            </Field>

            <Field label="Notes">
              <textarea
                value={notes}
                onChange={(
                  event,
                ) =>
                  setNotes(
                    event.target
                      .value,
                  )
                }
                placeholder="Optional reconciliation notes..."
                className={
                  textareaClass
                }
              />
            </Field>

            <Actions
              busy={busy}
              cancel={() =>
                setCreateOpen(
                  false,
                )
              }
              submit={() =>
                void submitCreate()
              }
              text="Create Reconciliation"
            />
          </ModalCard>
        </Modal>
      )}

      {editing && (
        <Modal>
          <ModalCard
            title={`Edit ${editing.reconciliation_code}`}
            subtitle="Weights are locked. Only tolerance and notes can be changed while the record is still draft."
            close={() =>
              setEditing(null)
            }
          >
            <div className="grid gap-3 rounded-lg border border-slate-300 bg-slate-50 p-4 sm:grid-cols-3">
              <Info
                title="Field Weight"
                value={`${formatNumber(
                  editing.field_weight_kg,
                )} Kg`}
              />

              <Info
                title="Factory Weight"
                value={`${formatNumber(
                  editing.factory_weight_kg,
                )} Kg`}
              />

              <Info
                title="Difference"
                value={`${signed(
                  editing.difference_kg,
                )} Kg`}
              />
            </div>

            <Field label="Tolerance Percentage">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={
                  tolerance
                }
                onChange={(
                  event,
                ) =>
                  setTolerance(
                    event.target
                      .value,
                  )
                }
                className={
                  inputClass
                }
              />
            </Field>

            <Field label="Notes">
              <textarea
                value={notes}
                onChange={(
                  event,
                ) =>
                  setNotes(
                    event.target
                      .value,
                  )
                }
                className={
                  textareaClass
                }
              />
            </Field>

            <Actions
              busy={busy}
              cancel={() =>
                setEditing(null)
              }
              submit={() =>
                void submitEdit()
              }
              text="Save Changes"
            />
          </ModalCard>
        </Modal>
      )}

      {cancelTarget && (
        <Modal>
          <ModalCard
            title={`Cancel ${cancelTarget.reconciliation_code}`}
            subtitle="The record stays in the audit history and the Factory Reception can be reconciled again."
            close={() =>
              setCancelTarget(
                null,
              )
            }
          >
            <Field label="Cancellation Reason">
              <textarea
                value={
                  cancellationReason
                }
                onChange={(
                  event,
                ) =>
                  setCancellationReason(
                    event.target
                      .value,
                  )
                }
                placeholder="Explain why this reconciliation is being cancelled..."
                className={
                  textareaClass
                }
              />
            </Field>

            <div className="flex justify-end gap-2 border-t border-slate-300 pt-4">
              <button
                type="button"
                onClick={() =>
                  setCancelTarget(
                    null,
                  )
                }
                className="h-10 rounded-lg border border-slate-400 px-4 text-sm font-bold"
              >
                Keep Record
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void submitCancel()
                }
                className="h-10 rounded-lg bg-red-700 px-5 text-sm font-bold text-white disabled:opacity-50"
              >
                {busy
                  ? "Cancelling..."
                  : "Cancel Reconciliation"}
              </button>
            </div>
          </ModalCard>
        </Modal>
      )}

      {viewing && (
        <Modal>
          <ModalCard
            title={
              viewing.reconciliation_code
            }
            subtitle="Full field-to-factory weight comparison."
            close={() =>
              setViewing(null)
            }
          >
            <div className="grid gap-x-6 md:grid-cols-3">
              <Detail
                title="Status"
                value={label(
                  viewing.status,
                )}
              />

              <Detail
                title="Outcome"
                value={
                  viewing.outcome
                    ? label(
                        viewing.outcome,
                      )
                    : "Pending"
                }
              />

              <Detail
                title="Factory Reception"
                value={
                  viewing.factory_reception
                    ?.reception_code ??
                  `#${viewing.factory_reception_id}`
                }
              />

              <Detail
                title="Agent"
                value={agentName(
                  viewing,
                )}
              />

              <Detail
                title="Collection"
                value={
                  viewing.agent_collection
                    ?.collection_code ??
                  "—"
                }
              />

              <Detail
                title="Field Weighing"
                value={
                  viewing.field_weighing
                    ?.weighing_code ??
                  "—"
                }
              />

              <Detail
                title="Field Weight"
                value={`${formatNumber(
                  viewing.field_weight_kg,
                )} Kg`}
              />

              <Detail
                title="Factory Weight"
                value={`${formatNumber(
                  viewing.factory_weight_kg,
                )} Kg`}
              />

              <Detail
                title="Difference"
                value={`${signed(
                  viewing.difference_kg,
                )} Kg`}
              />

              <Detail
                title="Difference %"
                value={`${signed(
                  viewing.difference_percentage,
                )}%`}
              />

              <Detail
                title="Tolerance"
                value={`${formatNumber(
                  viewing.tolerance_percentage,
                )}%`}
              />

              <Detail
                title="Reconciled By"
                value={
                  viewing.reconciler
                    ?.name ??
                  "—"
                }
              />

              <Detail
                title="Reconciled At"
                value={formatDateTime(
                  viewing.reconciled_at,
                )}
              />
            </div>

            {viewing.notes && (
              <div className="rounded-lg border border-slate-300 bg-slate-50 p-4">
                <p className="text-xs font-extrabold uppercase text-slate-600">
                  Notes
                </p>

                <p className="mt-2 text-sm font-medium">
                  {viewing.notes}
                </p>
              </div>
            )}

            {viewing.status ===
              "cancelled" && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-4">
                <p className="text-xs font-extrabold uppercase text-red-800">
                  Cancellation
                </p>

                <p className="mt-2 text-sm font-semibold text-red-900">
                  {viewing.cancellation_reason ??
                    "No reason recorded."}
                </p>
              </div>
            )}
          </ModalCard>
        </Modal>
      )}
    </div>
  );
}

function Difference({
  kg,
  percentage,
}: {
  kg: string;
  percentage: string;
}) {
  const value =
    Number(kg);

  const className =
    value < 0
      ? "text-red-700"
      : value > 0
        ? "text-amber-700"
        : "text-emerald-700";

  return (
    <div
      className={`font-extrabold ${className}`}
    >
      <p>
        {signed(kg)} Kg
      </p>

      <p className="mt-1 text-xs">
        {signed(
          percentage,
        )}
        %
      </p>
    </div>
  );
}

function OutcomeBadge({
  outcome,
}: {
  outcome?:
    | WeightReconciliationOutcome
    | null;
}) {
  if (!outcome) {
    return (
      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-700">
        Pending
      </span>
    );
  }

  const styles: Record<
    WeightReconciliationOutcome,
    string
  > = {
    within_tolerance:
      "bg-emerald-100 text-emerald-900",

    shortage:
      "bg-red-100 text-red-900",

    excess:
      "bg-amber-100 text-amber-900",
  };

  return (
    <span
      className={`rounded-md px-2.5 py-1 text-xs font-extrabold ${styles[outcome]}`}
    >
      {label(outcome)}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: WeightReconciliationStatus;
}) {
  const styles: Record<
    WeightReconciliationStatus,
    string
  > = {
    draft:
      "bg-slate-100 text-slate-800",

    reconciled:
      "bg-emerald-100 text-emerald-900",

    cancelled:
      "bg-red-100 text-red-900",
  };

  return (
    <span
      className={`rounded-md px-2.5 py-1 text-xs font-extrabold ${styles[status]}`}
    >
      {label(status)}
    </span>
  );
}

function Metric({
  title,
  value,
  icon,
  green = false,
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
  green?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-extrabold uppercase text-slate-700">
          {title}
        </p>

        <span
          className={
            green
              ? "text-[#075b38]"
              : "text-[#80570f]"
          }
        >
          {icon}
        </span>
      </div>

      <p
        className={`mt-2 text-2xl font-extrabold ${
          green
            ? "text-[#075b38]"
            : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function MiniMetric({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-slate-300 bg-white px-4 py-3">
      <p className="text-xs font-extrabold uppercase text-slate-600">
        {title}
      </p>

      <p className="mt-1 text-xl font-extrabold">
        {value}
      </p>
    </div>
  );
}

function Field({
  label: title,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold">
        {title}
      </label>

      {children}
    </div>
  );
}

function Info({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-extrabold uppercase text-[#80570f]">
        {title}
      </p>

      <p className="mt-1 text-sm font-bold">
        {value}
      </p>
    </div>
  );
}

function Detail({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="border-b border-slate-300 py-4">
      <p className="text-xs font-extrabold uppercase text-slate-600">
        {title}
      </p>

      <p className="mt-1.5 text-sm font-bold">
        {value}
      </p>
    </div>
  );
}

function IconButton({
  title,
  children,
  onClick,
}: {
  title: string;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-400 bg-white hover:bg-slate-100"
    >
      {children}
    </button>
  );
}

function Actions({
  busy,
  cancel,
  submit,
  text,
}: {
  busy: boolean;
  cancel: () => void;
  submit: () => void;
  text: string;
}) {
  return (
    <div className="flex justify-end gap-2 border-t border-slate-300 pt-4">
      <button
        type="button"
        disabled={busy}
        onClick={cancel}
        className="h-10 rounded-lg border border-slate-400 px-4 text-sm font-bold"
      >
        Cancel
      </button>

      <button
        type="button"
        disabled={busy}
        onClick={submit}
        className="h-10 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white disabled:opacity-50"
      >
        {busy
          ? "Saving..."
          : text}
      </button>
    </div>
  );
}

function Pagination({
  page,
  lastPage,
  total,
  setPage,
}: {
  page: number;
  lastPage: number;
  total: number;
  setPage: (
    value: number,
  ) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-300 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-slate-700">
        {total} records · Page{" "}
        <b>{page}</b> of{" "}
        <b>{lastPage}</b>
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
          className="h-9 rounded-lg border border-slate-400 px-4 text-sm font-bold disabled:opacity-40"
        >
          Previous
        </button>

        <button
          type="button"
          disabled={
            page >= lastPage
          }
          onClick={() =>
            setPage(page + 1)
          }
          className="h-9 rounded-lg border border-slate-400 px-4 text-sm font-bold disabled:opacity-40"
        >
          Next
        </button>
      </div>
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

function ModalCard({
  title,
  subtitle,
  close,
  children,
}: {
  title: string;
  subtitle: string;
  close: () => void;
  children: ReactNode;
}) {
  return (
    <div className="w-full max-w-4xl rounded-xl bg-white shadow-2xl">
      <div className="flex items-start justify-between border-b border-slate-300 px-6 py-4">
        <div>
          <h2 className="text-xl font-extrabold">
            {title}
          </h2>

          <p className="mt-1 text-sm font-medium text-slate-600">
            {subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={close}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-400"
        >
          <X size={18} />
        </button>
      </div>

      <div className="max-h-[78vh] space-y-4 overflow-y-auto p-6">
        {children}
      </div>
    </div>
  );
}

function Notice({
  text,
  error = false,
}: {
  text: string;
  error?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm font-semibold ${
        error
          ? "border-red-300 bg-red-50 text-red-900"
          : "border-emerald-300 bg-emerald-50 text-emerald-900"
      }`}
    >
      {text}
    </div>
  );
}

function agentName(
  item: WeightReconciliation,
) {
  return (
    item.agent?.user?.name ??
    item.agent?.agent_code ??
    `Agent #${item.agent_id}`
  );
}

function label(
  value: string,
) {
  return value
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function formatNumber(
  value: string | number,
) {
  const parsed =
    Number(value);

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

function signed(
  value: string | number,
) {
  const parsed =
    Number(value);

  if (
    !Number.isFinite(parsed)
  ) {
    return "0";
  }

  if (parsed > 0) {
    return `+${formatNumber(
      parsed,
    )}`;
  }

  return formatNumber(parsed);
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

function errorMessage(
  error: unknown,
) {
  return error instanceof Error
    ? error.message
    : "Something went wrong.";
}
