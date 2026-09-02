"use client";

import {
  BarChart3,
  CheckCircle2,
  Eye,
  LoaderCircle,
  PackageCheck,
  Pencil,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  Weight,
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
  cancelProcessingYield,
  confirmProcessingYield,
  createProcessingYield,
  getEligibleProcessingBatches,
  getProcessingYield,
  getProcessingYieldRole,
  getProcessingYields,
  getProcessingYieldSummary,
  updateProcessingYield,
} from "@/services/processing-yield-service";

import type {
  DashboardRole,
  EligibleProcessingBatch,
  ProcessingYield,
  ProcessingYieldStatus,
  ProcessingYieldSummary,
} from "@/types/processing-yield";

const inputClass =
  "h-11 w-full rounded-lg border border-slate-400 bg-white px-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-600 focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

const textareaClass =
  "min-h-24 w-full rounded-lg border border-slate-400 bg-white px-3 py-2.5 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-600 focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

const emptySummary: ProcessingYieldSummary = {
  total_records: 0,
  draft_records: 0,
  confirmed_records: 0,
  cancelled_records: 0,

  total_input_kg: "0.00",
  total_output_kg: "0.00",
  total_loss_kg: "0.00",

  average_yield_percentage: "0.00",
  average_loss_percentage: "0.00",
};

export default function ProcessingYieldManagement() {
  const [items, setItems] =
    useState<ProcessingYield[]>([]);

  const [summary, setSummary] =
    useState<ProcessingYieldSummary>(
      emptySummary,
    );

  const [role, setRole] =
    useState<DashboardRole>("");

  const [
    eligibleBatches,
    setEligibleBatches,
  ] =
    useState<
      EligibleProcessingBatch[]
    >([]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [coffeeType, setCoffeeType] =
    useState("");

  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");

  const [filters, setFilters] =
    useState({
      search: "",
      status: "",
      coffeeType: "",
      dateFrom: "",
      dateTo: "",
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

  const [editing, setEditing] =
    useState<ProcessingYield | null>(
      null,
    );

  const [viewing, setViewing] =
    useState<ProcessingYield | null>(
      null,
    );

  const [
    cancelTarget,
    setCancelTarget,
  ] =
    useState<ProcessingYield | null>(
      null,
    );

  const [
    processingBatchId,
    setProcessingBatchId,
  ] = useState("");

  const [
    outputQuantity,
    setOutputQuantity,
  ] = useState("");

  const [
    outputCoffeeType,
    setOutputCoffeeType,
  ] = useState("");

  const [
    outputBagCount,
    setOutputBagCount,
  ] = useState("");

  const [
    yieldDate,
    setYieldDate,
  ] = useState("");

  const [notes, setNotes] =
    useState("");

  const [
    cancellationReason,
    setCancellationReason,
  ] = useState("");

  const canManage =
    role === "admin";

  const selectedBatch =
    useMemo(() => {
      return eligibleBatches.find(
        (batch) =>
          batch.id ===
          Number(
            processingBatchId,
          ),
      ) ?? null;
    }, [
      eligibleBatches,
      processingBatchId,
    ]);

  const preview =
    useMemo(() => {
      const input = Number(
        selectedBatch
          ?.input_quantity_kg ??
          editing
            ?.input_quantity_kg ??
          0,
      );

      const output =
        Number(outputQuantity);

      if (
        !Number.isFinite(input) ||
        !Number.isFinite(output) ||
        input <= 0 ||
        output <= 0 ||
        output > input
      ) {
        return null;
      }

      const loss =
        input - output;

      return {
        input,
        output,
        loss,

        yieldPercentage:
          (output / input) *
          100,

        lossPercentage:
          (loss / input) *
          100,
      };
    }, [
      selectedBatch,
      editing,
      outputQuantity,
    ]);

  const load = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const [list, totals] =
          await Promise.all([
            getProcessingYields({
              search:
                filters.search ||
                undefined,

              status:
                filters.status
                  ? (
                      filters.status as ProcessingYieldStatus
                    )
                  : undefined,

              output_coffee_type:
                filters.coffeeType ||
                undefined,

              date_from:
                filters.dateFrom ||
                undefined,

              date_to:
                filters.dateTo ||
                undefined,

              page,
              per_page: 15,
            }),

            getProcessingYieldSummary(),
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
          await getProcessingYieldRole();

        setRole(currentRole);

        if (
          currentRole === "admin"
        ) {
          setEligibleBatches(
            await getEligibleProcessingBatches(),
          );
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

  async function refreshEligibleBatches() {
    if (!canManage) {
      return;
    }

    setEligibleBatches(
      await getEligibleProcessingBatches(),
    );
  }

  function applyFilters() {
    setFilters({
      search:
        search.trim(),

      status,

      coffeeType:
        coffeeType.trim(),

      dateFrom,

      dateTo,
    });

    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setStatus("");
    setCoffeeType("");
    setDateFrom("");
    setDateTo("");

    setFilters({
      search: "",
      status: "",
      coffeeType: "",
      dateFrom: "",
      dateTo: "",
    });

    setPage(1);
  }

  async function openCreate() {
    setError("");
    setSuccess("");

    try {
      await refreshEligibleBatches();

      setProcessingBatchId("");
      setOutputQuantity("");
      setOutputCoffeeType("");
      setOutputBagCount("");
      setYieldDate("");
      setNotes("");

      setCreateOpen(true);
    } catch (error) {
      setError(
        errorMessage(error),
      );
    }
  }

  async function submitCreate() {
    if (!processingBatchId) {
      setError(
        "Select a completed Processing Batch.",
      );
      return;
    }

    const output =
      Number(outputQuantity);

    const input =
      Number(
        selectedBatch
          ?.input_quantity_kg ??
          0,
      );

    if (
      !Number.isFinite(output) ||
      output <= 0
    ) {
      setError(
        "Output quantity must be greater than zero.",
      );
      return;
    }

    if (
      input > 0 &&
      output > input
    ) {
      setError(
        "Output quantity cannot exceed Processing input.",
      );
      return;
    }

    if (
      outputCoffeeType
        .trim()
        .length < 2
    ) {
      setError(
        "Output Coffee Type is required.",
      );
      return;
    }

    if (
      outputBagCount &&
      Number(outputBagCount) < 0
    ) {
      setError(
        "Bag count cannot be negative.",
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      await createProcessingYield({
        processing_batch_id:
          Number(
            processingBatchId,
          ),

        output_quantity_kg:
          output,

        output_coffee_type:
          outputCoffeeType.trim(),

        output_bag_count:
          outputBagCount
            ? Number(
                outputBagCount,
              )
            : undefined,

        yield_date:
          yieldDate ||
          undefined,

        notes:
          notes.trim() ||
          undefined,
      });

      setCreateOpen(false);

      setSuccess(
        "Processing Yield & Loss draft created successfully.",
      );

      await Promise.all([
        load(),
        refreshEligibleBatches(),
      ]);
    } catch (error) {
      setError(
        errorMessage(error),
      );
    } finally {
      setBusy(false);
    }
  }

  function openEdit(
    record: ProcessingYield,
  ) {
    setEditing(record);

    setOutputQuantity(
      record.output_quantity_kg,
    );

    setOutputCoffeeType(
      record.output_coffee_type,
    );

    setOutputBagCount(
      record.output_bag_count !==
        null &&
      record.output_bag_count !==
        undefined
        ? String(
            record.output_bag_count,
          )
        : "",
    );

    setYieldDate(
      record.yield_date ??
      "",
    );

    setNotes(
      record.notes ??
      "",
    );
  }

  async function submitEdit() {
    if (!editing) {
      return;
    }

    const output =
      Number(outputQuantity);

    const input =
      Number(
        editing.input_quantity_kg,
      );

    if (
      !Number.isFinite(output) ||
      output <= 0
    ) {
      setError(
        "Output quantity must be greater than zero.",
      );
      return;
    }

    if (
      output > input
    ) {
      setError(
        "Output quantity cannot exceed Processing input.",
      );
      return;
    }

    if (
      outputCoffeeType
        .trim()
        .length < 2
    ) {
      setError(
        "Output Coffee Type is required.",
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      await updateProcessingYield(
        editing.id,
        {
          output_quantity_kg:
            output,

          output_coffee_type:
            outputCoffeeType.trim(),

          output_bag_count:
            outputBagCount
              ? Number(
                  outputBagCount,
                )
              : null,

          yield_date:
            yieldDate ||
            null,

          notes:
            notes.trim() ||
            null,
        },
      );

      setEditing(null);

      setSuccess(
        "Processing Yield record updated successfully.",
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

  async function confirmRecord(
    record: ProcessingYield,
  ) {
    const confirmed =
      window.confirm(
        `Confirm ${record.yield_code}? A new Coffee Lot of ${formatNumber(
          record.output_quantity_kg,
        )} Kg will be created.`,
      );

    if (!confirmed) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const result =
        await confirmProcessingYield(
          record.id,
        );

      const lot =
        result.output_coffee_lot
          ?.lot_code;

      setSuccess(
        lot
          ? `${record.yield_code} confirmed. Output Coffee Lot ${lot} was created.`
          : `${record.yield_code} confirmed successfully.`,
      );

      await Promise.all([
        load(),
        refreshEligibleBatches(),
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
    record: ProcessingYield,
  ) {
    try {
      setViewing(
        await getProcessingYield(
          record.id,
        ),
      );
    } catch (error) {
      setError(
        errorMessage(error),
      );
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
      await cancelProcessingYield(
        cancelTarget.id,
        cancellationReason.trim(),
      );

      setCancelTarget(null);
      setCancellationReason("");

      setSuccess(
        "Processing Yield record cancelled successfully.",
      );

      await Promise.all([
        load(),
        refreshEligibleBatches(),
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
            Processing Yield & Loss
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-700">
            Record actual processed
            coffee output and monitor
            yield, processing loss and
            resulting Coffee Lots.
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
            Record Yield & Loss
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Processed Input"
          value={`${formatNumber(
            summary.total_input_kg,
          )} Kg`}
          icon={
            <Weight size={19} />
          }
        />

        <Metric
          title="Processed Output"
          value={`${formatNumber(
            summary.total_output_kg,
          )} Kg`}
          icon={
            <PackageCheck
              size={19}
            />
          }
          green
        />

        <Metric
          title="Total Loss"
          value={`${formatNumber(
            summary.total_loss_kg,
          )} Kg`}
          icon={
            <TrendingDown
              size={19}
            />
          }
        />

        <Metric
          title="Average Yield"
          value={`${formatNumber(
            summary.average_yield_percentage,
          )}%`}
          icon={
            <TrendingUp
              size={19}
            />
          }
          green
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <MiniMetric
          title="Total Records"
          value={String(
            summary.total_records,
          )}
        />

        <MiniMetric
          title="Draft"
          value={String(
            summary.draft_records,
          )}
        />

        <MiniMetric
          title="Confirmed"
          value={String(
            summary.confirmed_records,
          )}
        />

        <MiniMetric
          title="Average Loss"
          value={`${formatNumber(
            summary.average_loss_percentage,
          )}%`}
        />
      </div>

      <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1fr_170px_180px_160px_160px_auto_auto]">
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
              placeholder="Search yield, batch or Coffee Lot..."
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

            <option value="confirmed">
              Confirmed
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>

          <input
            value={coffeeType}
            onChange={(event) =>
              setCoffeeType(
                event.target.value,
              )
            }
            placeholder="Output coffee type"
            className={inputClass}
          />

          <input
            type="date"
            value={dateFrom}
            onChange={(event) =>
              setDateFrom(
                event.target.value,
              )
            }
            className={inputClass}
          />

          <input
            type="date"
            value={dateTo}
            onChange={(event) =>
              setDateTo(
                event.target.value,
              )
            }
            className={inputClass}
          />

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
          <table className="w-full min-w-[1450px]">
            <thead className="bg-[#f6f1e8]">
              <tr className="border-b border-slate-300 text-left text-xs font-extrabold uppercase text-slate-800">
                <th className="px-4 py-4">
                  Yield
                </th>

                <th className="px-4 py-4">
                  Batch
                </th>

                <th className="px-4 py-4">
                  Input
                </th>

                <th className="px-4 py-4">
                  Output
                </th>

                <th className="px-4 py-4">
                  Loss
                </th>

                <th className="px-4 py-4">
                  Yield %
                </th>

                <th className="px-4 py-4">
                  Loss %
                </th>

                <th className="px-4 py-4">
                  Output Type
                </th>

                <th className="px-4 py-4">
                  Output Lot
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
                    colSpan={11}
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
                  (record) => (
                    <tr
                      key={record.id}
                      className="border-b border-slate-200 text-sm hover:bg-[#fffdf8]"
                    >
                      <td className="px-4 py-4">
                        <p className="font-extrabold text-[#80570f]">
                          {
                            record.yield_code
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {
                            record.yield_date
                          }
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-bold">
                          {record.processing_batch
                            ?.batch_code ??
                            `#${record.processing_batch_id}`}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {record.processing_batch
                            ?.process_name ??
                            "—"}
                        </p>
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {formatNumber(
                          record.input_quantity_kg,
                        )}{" "}
                        Kg
                      </td>

                      <td className="px-4 py-4 font-extrabold text-[#075b38]">
                        {formatNumber(
                          record.output_quantity_kg,
                        )}{" "}
                        Kg
                      </td>

                      <td className="px-4 py-4 font-extrabold text-red-700">
                        {formatNumber(
                          record.loss_quantity_kg,
                        )}{" "}
                        Kg
                      </td>

                      <td className="px-4 py-4">
                        <PercentageBadge
                          value={
                            record.yield_percentage
                          }
                          good
                        />
                      </td>

                      <td className="px-4 py-4">
                        <PercentageBadge
                          value={
                            record.loss_percentage
                          }
                        />
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {label(
                          record.output_coffee_type,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {record.output_coffee_lot ? (
                          <div>
                            <p className="font-extrabold text-[#075b38]">
                              {
                                record.output_coffee_lot
                                  .lot_code
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                              {formatNumber(
                                record.output_coffee_lot
                                  .current_weight_kg ??
                                  record.output_quantity_kg,
                              )}{" "}
                              Kg
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-500">
                            Pending confirmation
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          status={
                            record.status
                          }
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-2">
                          <IconButton
                            title="View"
                            onClick={() =>
                              void openView(
                                record,
                              )
                            }
                          >
                            <Eye size={15} />
                          </IconButton>

                          {canManage &&
                            record.status ===
                              "draft" && (
                              <>
                                <IconButton
                                  title="Edit"
                                  onClick={() =>
                                    openEdit(
                                      record,
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
                                  disabled={busy}
                                  onClick={() =>
                                    void confirmRecord(
                                      record,
                                    )
                                  }
                                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#075b38] px-3 text-xs font-bold text-white disabled:opacity-50"
                                >
                                  <CheckCircle2
                                    size={
                                      14
                                    }
                                  />
                                  Confirm
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setCancelTarget(
                                      record,
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
                    colSpan={11}
                    className="py-16 text-center"
                  >
                    <BarChart3
                      size={40}
                      className="mx-auto text-slate-400"
                    />

                    <p className="mt-3 font-bold">
                      No Processing Yield
                      records found.
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
            title="Record Processing Yield & Loss"
            subtitle="Select a completed Processing Batch and enter only the actual output quantity."
            close={() =>
              setCreateOpen(false)
            }
          >
            <Field label="Completed Processing Batch">
              <select
                value={
                  processingBatchId
                }
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setProcessingBatchId(
                    value,
                  );

                  setOutputQuantity("");
                  setOutputCoffeeType("");
                  setOutputBagCount("");
                }}
                className={inputClass}
              >
                <option value="">
                  Select Processing Batch
                </option>

                {eligibleBatches.map(
                  (batch) => (
                    <option
                      key={batch.id}
                      value={batch.id}
                    >
                      {batch.batch_code}
                      {" — "}
                      {batch.process_name}
                      {" — "}
                      {formatNumber(
                        batch.input_quantity_kg,
                      )}
                      {" Kg"}
                    </option>
                  ),
                )}
              </select>
            </Field>

            {selectedBatch && (
              <div className="grid gap-3 rounded-lg border border-[#d9c9ae] bg-[#fffaf2] p-4 sm:grid-cols-2 lg:grid-cols-4">
                <Info
                  title="Batch"
                  value={
                    selectedBatch.batch_code
                  }
                />

                <Info
                  title="Process"
                  value={
                    selectedBatch.process_name
                  }
                />

                <Info
                  title="Input"
                  value={`${formatNumber(
                    selectedBatch.input_quantity_kg,
                  )} Kg`}
                />

                <Info
                  title="Source Lot"
                  value={
                    selectedBatch.coffee_lot
                      ?.lot_code ??
                    `#${selectedBatch.coffee_lot_id}`
                  }
                />
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Actual Output Quantity (Kg)">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    outputQuantity
                  }
                  onChange={(event) =>
                    setOutputQuantity(
                      event.target.value,
                    )
                  }
                  placeholder="0.00"
                  className={inputClass}
                />
              </Field>

              <Field label="Output Coffee Type">
                <input
                  list="yield-coffee-types"
                  value={
                    outputCoffeeType
                  }
                  onChange={(event) =>
                    setOutputCoffeeType(
                      event.target.value,
                    )
                  }
                  placeholder="Example: Parchment"
                  className={inputClass}
                />

                <datalist id="yield-coffee-types">
                  <option value="Parchment" />
                  <option value="Green Coffee" />
                  <option value="Dry Parchment" />
                  <option value="Washed Coffee" />
                  <option value="Sorted Coffee" />
                  <option value="Graded Coffee" />
                </datalist>
              </Field>
            </div>

            {preview && (
              <YieldPreview
                input={preview.input}
                output={preview.output}
                loss={preview.loss}
                yieldPercentage={
                  preview.yieldPercentage
                }
                lossPercentage={
                  preview.lossPercentage
                }
              />
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Output Bag Count">
                <input
                  type="number"
                  min="0"
                  value={
                    outputBagCount
                  }
                  onChange={(event) =>
                    setOutputBagCount(
                      event.target.value,
                    )
                  }
                  placeholder="Optional"
                  className={inputClass}
                />
              </Field>

              <Field label="Yield Date">
                <input
                  type="date"
                  value={yieldDate}
                  onChange={(event) =>
                    setYieldDate(
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-bold text-emerald-950">
                Loss and percentages
                are calculated by the
                backend.
              </p>

              <p className="mt-1 text-xs font-medium text-emerald-800">
                Confirming this record
                will create a new Coffee
                Lot using the actual
                output quantity.
              </p>
            </div>

            <Field label="Notes">
              <textarea
                value={notes}
                onChange={(event) =>
                  setNotes(
                    event.target.value,
                  )
                }
                placeholder="Optional Yield & Loss notes..."
                className={textareaClass}
              />
            </Field>

            <Actions
              busy={busy}
              cancel={() =>
                setCreateOpen(false)
              }
              submit={() =>
                void submitCreate()
              }
              text="Create Draft"
            />
          </ModalCard>
        </Modal>
      )}

      {editing && (
        <Modal>
          <ModalCard
            title={`Edit ${editing.yield_code}`}
            subtitle="Only draft Yield & Loss records can be changed."
            close={() =>
              setEditing(null)
            }
          >
            <div className="grid gap-3 rounded-lg border border-slate-300 bg-slate-50 p-4 sm:grid-cols-3">
              <Info
                title="Processing Batch"
                value={
                  editing.processing_batch
                    ?.batch_code ??
                  `#${editing.processing_batch_id}`
                }
              />

              <Info
                title="Input"
                value={`${formatNumber(
                  editing.input_quantity_kg,
                )} Kg`}
              />

              <Info
                title="Process"
                value={
                  editing.processing_batch
                    ?.process_name ??
                  "—"
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Output Quantity (Kg)">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    outputQuantity
                  }
                  onChange={(event) =>
                    setOutputQuantity(
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Output Coffee Type">
                <input
                  value={
                    outputCoffeeType
                  }
                  onChange={(event) =>
                    setOutputCoffeeType(
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            {preview && (
              <YieldPreview
                input={preview.input}
                output={preview.output}
                loss={preview.loss}
                yieldPercentage={
                  preview.yieldPercentage
                }
                lossPercentage={
                  preview.lossPercentage
                }
              />
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Output Bag Count">
                <input
                  type="number"
                  min="0"
                  value={
                    outputBagCount
                  }
                  onChange={(event) =>
                    setOutputBagCount(
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Yield Date">
                <input
                  type="date"
                  value={yieldDate}
                  onChange={(event) =>
                    setYieldDate(
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Notes">
              <textarea
                value={notes}
                onChange={(event) =>
                  setNotes(
                    event.target.value,
                  )
                }
                className={textareaClass}
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
            title={`Cancel ${cancelTarget.yield_code}`}
            subtitle="The record stays in history. Because it is still draft, no output Coffee Lot has been created yet."
            close={() =>
              setCancelTarget(null)
            }
          >
            <Field label="Cancellation Reason">
              <textarea
                value={
                  cancellationReason
                }
                onChange={(event) =>
                  setCancellationReason(
                    event.target.value,
                  )
                }
                placeholder="Explain why this Yield & Loss record is being cancelled..."
                className={textareaClass}
              />
            </Field>

            <div className="flex justify-end gap-2 border-t border-slate-300 pt-4">
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  setCancelTarget(null)
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
                  : "Cancel Record"}
              </button>
            </div>
          </ModalCard>
        </Modal>
      )}

      {viewing && (
        <Modal>
          <ModalCard
            title={
              viewing.yield_code
            }
            subtitle="Processing input, output, yield, loss and output Coffee Lot traceability."
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
                title="Processing Batch"
                value={
                  viewing.processing_batch
                    ?.batch_code ??
                  `#${viewing.processing_batch_id}`
                }
              />

              <Detail
                title="Process"
                value={
                  viewing.processing_batch
                    ?.process_name ??
                  "—"
                }
              />

              <Detail
                title="Input Quantity"
                value={`${formatNumber(
                  viewing.input_quantity_kg,
                )} Kg`}
              />

              <Detail
                title="Output Quantity"
                value={`${formatNumber(
                  viewing.output_quantity_kg,
                )} Kg`}
              />

              <Detail
                title="Loss Quantity"
                value={`${formatNumber(
                  viewing.loss_quantity_kg,
                )} Kg`}
              />

              <Detail
                title="Yield"
                value={`${formatNumber(
                  viewing.yield_percentage,
                )}%`}
              />

              <Detail
                title="Loss"
                value={`${formatNumber(
                  viewing.loss_percentage,
                )}%`}
              />

              <Detail
                title="Output Coffee Type"
                value={label(
                  viewing.output_coffee_type,
                )}
              />

              <Detail
                title="Output Bags"
                value={
                  viewing.output_bag_count !==
                    null &&
                  viewing.output_bag_count !==
                    undefined
                    ? String(
                        viewing.output_bag_count,
                      )
                    : "—"
                }
              />

              <Detail
                title="Yield Date"
                value={
                  viewing.yield_date
                }
              />

              <Detail
                title="Source Coffee Lot"
                value={
                  viewing.source_coffee_lot
                    ?.lot_code ??
                  `#${viewing.source_coffee_lot_id}`
                }
              />

              <Detail
                title="Confirmed By"
                value={
                  viewing.confirmer
                    ?.name ??
                  "—"
                }
              />

              <Detail
                title="Confirmed At"
                value={formatDateTime(
                  viewing.confirmed_at,
                )}
              />
            </div>

            {viewing.output_coffee_lot && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
                <p className="text-xs font-extrabold uppercase text-emerald-800">
                  Output Coffee Lot
                </p>

                <div className="mt-3 grid gap-4 sm:grid-cols-4">
                  <Info
                    title="Lot"
                    value={
                      viewing.output_coffee_lot
                        .lot_code
                    }
                  />

                  <Info
                    title="Coffee Type"
                    value={label(
                      viewing.output_coffee_lot
                        .coffee_type ??
                        viewing.output_coffee_type,
                    )}
                  />

                  <Info
                    title="Weight"
                    value={`${formatNumber(
                      viewing.output_coffee_lot
                        .current_weight_kg ??
                        viewing.output_quantity_kg,
                    )} Kg`}
                  />

                  <Info
                    title="Stage"
                    value={label(
                      viewing.output_coffee_lot
                        .processing_stage ??
                        "received",
                    )}
                  />
                </div>
              </div>
            )}

            {viewing.notes && (
              <TextBlock
                title="Notes"
                text={
                  viewing.notes
                }
              />
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

                <p className="mt-2 text-xs font-medium text-red-800">
                  By:{" "}
                  {viewing.canceller
                    ?.name ??
                    "—"}{" "}
                  ·{" "}
                  {formatDateTime(
                    viewing.cancelled_at,
                  )}
                </p>
              </div>
            )}
          </ModalCard>
        </Modal>
      )}
    </div>
  );
}

function YieldPreview({
  input,
  output,
  loss,
  yieldPercentage,
  lossPercentage,
}: {
  input: number;
  output: number;
  loss: number;
  yieldPercentage: number;
  lossPercentage: number;
}) {
  return (
    <div className="rounded-lg border border-[#d9c9ae] bg-[#fffaf2] p-4">
      <p className="mb-3 text-xs font-extrabold uppercase text-[#80570f]">
        Yield Preview
      </p>

      <div className="grid gap-3 sm:grid-cols-5">
        <Info
          title="Input"
          value={`${formatNumber(
            input,
          )} Kg`}
        />

        <Info
          title="Output"
          value={`${formatNumber(
            output,
          )} Kg`}
        />

        <Info
          title="Loss"
          value={`${formatNumber(
            loss,
          )} Kg`}
        />

        <Info
          title="Yield"
          value={`${formatNumber(
            yieldPercentage,
          )}%`}
        />

        <Info
          title="Loss %"
          value={`${formatNumber(
            lossPercentage,
          )}%`}
        />
      </div>

      <p className="mt-3 text-xs font-medium text-slate-600">
        This is only a preview. The
        backend recalculates and stores
        the official values.
      </p>
    </div>
  );
}

function PercentageBadge({
  value,
  good = false,
}: {
  value: string;
  good?: boolean;
}) {
  return (
    <span
      className={`rounded-md px-2.5 py-1 text-xs font-extrabold ${
        good
          ? "bg-emerald-100 text-emerald-900"
          : "bg-red-100 text-red-900"
      }`}
    >
      {formatNumber(value)}%
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: ProcessingYieldStatus;
}) {
  const styles: Record<
    ProcessingYieldStatus,
    string
  > = {
    draft:
      "bg-slate-100 text-slate-800",

    confirmed:
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
  value: string;
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

function TextBlock({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-slate-300 bg-slate-50 p-4">
      <p className="text-xs font-extrabold uppercase text-slate-600">
        {title}
      </p>

      <p className="mt-2 text-sm font-medium">
        {text}
      </p>
    </div>
  );
}

function IconButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: ReactNode;
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
