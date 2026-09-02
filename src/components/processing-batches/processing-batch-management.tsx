"use client";

import {
  CheckCircle2,
  Clock3,
  Cog,
  Eye,
  LoaderCircle,
  Pencil,
  Play,
  Plus,
  Search,
  Warehouse,
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
  cancelProcessingBatch,
  completeProcessingBatch,
  createProcessingBatch,
  getProcessingBatch,
  getProcessingBatches,
  getProcessingInventoryLookup,
  getProcessingRole,
  getProcessingSummary,
  startProcessingBatch,
  updateProcessingBatch,
} from "@/services/processing-batch-service";

import type {
  DashboardRole,
  ProcessingBatch,
  ProcessingBatchStatus,
  ProcessingBatchSummary,
  ProcessingInventory,
} from "@/types/processing-batch";

const inputClass =
  "h-11 w-full rounded-lg border border-slate-400 bg-white px-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-600 focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

const textareaClass =
  "min-h-24 w-full rounded-lg border border-slate-400 bg-white px-3 py-2.5 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-600 focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

const emptySummary: ProcessingBatchSummary = {
  total_batches: 0,
  draft_batches: 0,
  in_progress_batches: 0,
  completed_batches: 0,
  cancelled_batches: 0,
  issued_to_processing_kg: "0.00",
  currently_processing_kg: "0.00",
};

export default function ProcessingBatchManagement() {
  const [items, setItems] =
    useState<ProcessingBatch[]>([]);

  const [summary, setSummary] =
    useState<ProcessingBatchSummary>(
      emptySummary,
    );

  const [role, setRole] =
    useState<DashboardRole>("");

  const [inventories, setInventories] =
    useState<ProcessingInventory[]>([]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [processFilter, setProcessFilter] =
    useState("");

  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");

  const [filters, setFilters] =
    useState({
      search: "",
      status: "",
      processName: "",
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
    useState<ProcessingBatch | null>(
      null,
    );

  const [viewing, setViewing] =
    useState<ProcessingBatch | null>(
      null,
    );

  const [
    cancelTarget,
    setCancelTarget,
  ] =
    useState<ProcessingBatch | null>(
      null,
    );

  const [inventoryId, setInventoryId] =
    useState("");

  const [processName, setProcessName] =
    useState("");

  const [inputQuantity, setInputQuantity] =
    useState("");

  const [
    plannedStartAt,
    setPlannedStartAt,
  ] = useState("");

  const [notes, setNotes] =
    useState("");

  const [
    cancellationReason,
    setCancellationReason,
  ] = useState("");

  const canManage =
    role === "admin";

  const selectedInventory =
    useMemo(() => {
      return inventories.find(
        (inventory) =>
          inventory.id ===
          Number(inventoryId),
      ) ?? null;
    }, [
      inventories,
      inventoryId,
    ]);

  const load = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const [list, totals] =
          await Promise.all([
            getProcessingBatches({
              search:
                filters.search ||
                undefined,

              status:
                filters.status
                  ? (
                      filters.status as ProcessingBatchStatus
                    )
                  : undefined,

              process_name:
                filters.processName ||
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

            getProcessingSummary(),
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
          await getProcessingRole();

        setRole(currentRole);

        if (
          currentRole === "admin"
        ) {
          setInventories(
            await getProcessingInventoryLookup(),
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

  async function refreshInventories() {
    if (!canManage) {
      return;
    }

    setInventories(
      await getProcessingInventoryLookup(),
    );
  }

  function applyFilters() {
    setFilters({
      search:
        search.trim(),

      status,

      processName:
        processFilter.trim(),

      dateFrom,

      dateTo,
    });

    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setStatus("");
    setProcessFilter("");
    setDateFrom("");
    setDateTo("");

    setFilters({
      search: "",
      status: "",
      processName: "",
      dateFrom: "",
      dateTo: "",
    });

    setPage(1);
  }

  async function openCreate() {
    setError("");
    setSuccess("");

    try {
      await refreshInventories();

      setInventoryId("");
      setProcessName("");
      setInputQuantity("");
      setPlannedStartAt("");
      setNotes("");

      setCreateOpen(true);
    } catch (error) {
      setError(
        errorMessage(error),
      );
    }
  }

  async function submitCreate() {
    if (!inventoryId) {
      setError(
        "Select Store Inventory.",
      );
      return;
    }

    if (
      processName.trim().length < 2
    ) {
      setError(
        "Process name is required.",
      );
      return;
    }

    const quantity =
      Number(inputQuantity);

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      setError(
        "Input quantity must be greater than zero.",
      );
      return;
    }

    if (
      selectedInventory &&
      quantity >
        Number(
          selectedInventory.current_quantity_kg,
        )
    ) {
      setError(
        "Processing quantity cannot exceed available stock.",
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      await createProcessingBatch({
        store_inventory_id:
          Number(inventoryId),

        process_name:
          processName.trim(),

        input_quantity_kg:
          quantity,

        planned_start_at:
          plannedStartAt ||
          undefined,

        notes:
          notes.trim() ||
          undefined,
      });

      setCreateOpen(false);

      setSuccess(
        "Processing Batch created successfully.",
      );

      await Promise.all([
        load(),
        refreshInventories(),
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
    batch: ProcessingBatch,
  ) {
    setEditing(batch);

    setProcessName(
      batch.process_name,
    );

    setInputQuantity(
      batch.input_quantity_kg,
    );

    setPlannedStartAt(
      toDateTimeLocal(
        batch.planned_start_at,
      ),
    );

    setNotes(
      batch.notes ?? "",
    );
  }

  async function submitEdit() {
    if (!editing) {
      return;
    }

    if (
      processName.trim().length < 2
    ) {
      setError(
        "Process name is required.",
      );
      return;
    }

    const quantity =
      Number(inputQuantity);

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      setError(
        "Input quantity must be greater than zero.",
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      await updateProcessingBatch(
        editing.id,
        {
          process_name:
            processName.trim(),

          input_quantity_kg:
            quantity,

          planned_start_at:
            plannedStartAt ||
            null,

          notes:
            notes.trim() ||
            null,
        },
      );

      setEditing(null);

      setSuccess(
        "Processing Batch updated successfully.",
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

  async function startBatch(
    batch: ProcessingBatch,
  ) {
    const confirmed =
      window.confirm(
        `Start ${batch.batch_code}? ${formatNumber(
          batch.input_quantity_kg,
        )} Kg will be issued from Store Inventory.`,
      );

    if (!confirmed) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await startProcessingBatch(
        batch.id,
      );

      setSuccess(
        `${batch.batch_code} started successfully. Stock was issued automatically.`,
      );

      await Promise.all([
        load(),
        refreshInventories(),
      ]);
    } catch (error) {
      setError(
        errorMessage(error),
      );
    } finally {
      setBusy(false);
    }
  }

  async function completeBatch(
    batch: ProcessingBatch,
  ) {
    const confirmed =
      window.confirm(
        `Mark ${batch.batch_code} as completed?`,
      );

    if (!confirmed) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await completeProcessingBatch(
        batch.id,
      );

      setSuccess(
        `${batch.batch_code} completed successfully.`,
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

  async function openView(
    batch: ProcessingBatch,
  ) {
    try {
      setViewing(
        await getProcessingBatch(
          batch.id,
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
      await cancelProcessingBatch(
        cancelTarget.id,
        cancellationReason.trim(),
      );

      setCancelTarget(null);
      setCancellationReason("");

      setSuccess(
        "Processing Batch cancelled successfully.",
      );

      await Promise.all([
        load(),
        refreshInventories(),
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
            Coffee Processing
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-700">
            Create and monitor coffee
            processing batches from
            stored coffee lots.
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
            New Processing Batch
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Total Batches"
          value={
            summary.total_batches
          }
          icon={
            <Cog size={19} />
          }
        />

        <Metric
          title="In Progress"
          value={
            summary.in_progress_batches
          }
          icon={
            <Clock3 size={19} />
          }
          green
        />

        <Metric
          title="Currently Processing"
          value={`${formatNumber(
            summary.currently_processing_kg,
          )} Kg`}
          icon={
            <Weight size={19} />
          }
        />

        <Metric
          title="Issued To Processing"
          value={`${formatNumber(
            summary.issued_to_processing_kg,
          )} Kg`}
          icon={
            <Warehouse size={19} />
          }
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <MiniMetric
          title="Draft"
          value={String(
            summary.draft_batches,
          )}
        />

        <MiniMetric
          title="Completed"
          value={String(
            summary.completed_batches,
          )}
        />

        <MiniMetric
          title="Cancelled"
          value={String(
            summary.cancelled_batches,
          )}
        />
      </div>

      <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1fr_180px_180px_160px_160px_auto_auto]">
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
              placeholder="Search batch, lot, inventory or process..."
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

            <option value="in_progress">
              In Progress
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>

          <input
            value={processFilter}
            onChange={(event) =>
              setProcessFilter(
                event.target.value,
              )
            }
            placeholder="Process"
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
          <table className="w-full min-w-[1400px]">
            <thead className="bg-[#f6f1e8]">
              <tr className="border-b border-slate-300 text-left text-xs font-extrabold uppercase text-slate-800">
                <th className="px-4 py-4">
                  Batch
                </th>

                <th className="px-4 py-4">
                  Inventory / Lot
                </th>

                <th className="px-4 py-4">
                  Process
                </th>

                <th className="px-4 py-4">
                  Input
                </th>

                <th className="px-4 py-4">
                  Storage
                </th>

                <th className="px-4 py-4">
                  Planned Start
                </th>

                <th className="px-4 py-4">
                  Started
                </th>

                <th className="px-4 py-4">
                  Completed
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
                  (batch) => (
                    <tr
                      key={batch.id}
                      className="border-b border-slate-200 text-sm hover:bg-[#fffdf8]"
                    >
                      <td className="px-4 py-4">
                        <p className="font-extrabold text-[#80570f]">
                          {
                            batch.batch_code
                          }
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-bold">
                          {batch.inventory
                            ?.inventory_code ??
                            `INV #${batch.store_inventory_id}`}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {batch.coffee_lot
                            ?.lot_code ??
                            `LOT #${batch.coffee_lot_id}`}
                        </p>
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {
                          batch.process_name
                        }
                      </td>

                      <td className="px-4 py-4 font-extrabold">
                        {formatNumber(
                          batch.input_quantity_kg,
                        )}{" "}
                        Kg
                      </td>

                      <td className="px-4 py-4">
                        {
                          batch.source_storage_location
                        }
                      </td>

                      <td className="px-4 py-4">
                        {formatDateTime(
                          batch.planned_start_at,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {formatDateTime(
                          batch.started_at,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {formatDateTime(
                          batch.completed_at,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          status={
                            batch.status
                          }
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-2">
                          <IconButton
                            title="View"
                            onClick={() =>
                              void openView(
                                batch,
                              )
                            }
                          >
                            <Eye size={15} />
                          </IconButton>

                          {canManage &&
                            batch.status ===
                              "draft" && (
                              <>
                                <IconButton
                                  title="Edit"
                                  onClick={() =>
                                    openEdit(
                                      batch,
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
                                    void startBatch(
                                      batch,
                                    )
                                  }
                                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#075b38] px-3 text-xs font-bold text-white disabled:opacity-50"
                                >
                                  <Play
                                    size={
                                      14
                                    }
                                  />
                                  Start
                                </button>
                              </>
                            )}

                          {canManage &&
                            batch.status ===
                              "in_progress" && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  void completeBatch(
                                    batch,
                                  )
                                }
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#075b38] px-3 text-xs font-bold text-white disabled:opacity-50"
                              >
                                <CheckCircle2
                                  size={
                                    14
                                  }
                                />
                                Complete
                              </button>
                            )}

                          {canManage &&
                            (
                              batch.status ===
                                "draft" ||
                              batch.status ===
                                "in_progress"
                            ) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCancelTarget(
                                    batch,
                                  );

                                  setCancellationReason(
                                    "",
                                  );
                                }}
                                className="h-9 rounded-lg border border-red-300 px-3 text-xs font-bold text-red-800 hover:bg-red-50"
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
                    colSpan={10}
                    className="py-16 text-center"
                  >
                    <Cog
                      size={40}
                      className="mx-auto text-slate-400"
                    />

                    <p className="mt-3 font-bold">
                      No Processing
                      Batches found.
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
            title="New Processing Batch"
            subtitle="Creating a draft does not change stock. Stock is issued only when the batch is started."
            close={() =>
              setCreateOpen(false)
            }
          >
            <Field label="Store Inventory">
              <select
                value={inventoryId}
                onChange={(event) =>
                  setInventoryId(
                    event.target.value,
                  )
                }
                className={inputClass}
              >
                <option value="">
                  Select Inventory
                </option>

                {inventories.map(
                  (inventory) => (
                    <option
                      key={inventory.id}
                      value={inventory.id}
                    >
                      {
                        inventory.inventory_code
                      }
                      {" — "}
                      {inventory.coffee_lot
                        ?.lot_code ??
                        `Lot #${inventory.coffee_lot_id}`}
                      {" — "}
                      {formatNumber(
                        inventory.current_quantity_kg,
                      )}
                      {" Kg"}
                    </option>
                  ),
                )}
              </select>
            </Field>

            {selectedInventory && (
              <div className="grid gap-3 rounded-lg border border-[#d9c9ae] bg-[#fffaf2] p-4 sm:grid-cols-2 lg:grid-cols-4">
                <Info
                  title="Inventory"
                  value={
                    selectedInventory.inventory_code
                  }
                />

                <Info
                  title="Coffee Lot"
                  value={
                    selectedInventory.coffee_lot
                      ?.lot_code ??
                    `#${selectedInventory.coffee_lot_id}`
                  }
                />

                <Info
                  title="Available Stock"
                  value={`${formatNumber(
                    selectedInventory.current_quantity_kg,
                  )} Kg`}
                />

                <Info
                  title="Location"
                  value={
                    selectedInventory.storage_location
                  }
                />
              </div>
            )}

            <Field label="Process Name">
              <input
                list="coffee-processes"
                value={processName}
                onChange={(event) =>
                  setProcessName(
                    event.target.value,
                  )
                }
                placeholder="Example: Pulping"
                className={inputClass}
              />

              <datalist id="coffee-processes">
                <option value="Pulping" />
                <option value="Fermentation" />
                <option value="Washing" />
                <option value="Drying" />
                <option value="Hulling" />
                <option value="Sorting" />
                <option value="Grading" />
              </datalist>
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Input Quantity (Kg)">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    inputQuantity
                  }
                  onChange={(event) =>
                    setInputQuantity(
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Planned Start">
                <input
                  type="datetime-local"
                  value={
                    plannedStartAt
                  }
                  onChange={(event) =>
                    setPlannedStartAt(
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-bold text-emerald-950">
                Creating this batch
                does not reduce stock.
              </p>

              <p className="mt-1 text-xs font-medium text-emerald-800">
                When you press Start,
                the backend automatically
                creates the Processing
                Issue Stock Movement and
                reduces Inventory.
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
                className={
                  textareaClass
                }
                placeholder="Optional processing notes..."
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
              text="Create Batch"
            />
          </ModalCard>
        </Modal>
      )}

      {editing && (
        <Modal>
          <ModalCard
            title={`Edit ${editing.batch_code}`}
            subtitle="Only draft Processing Batches can be changed."
            close={() =>
              setEditing(null)
            }
          >
            <div className="grid gap-3 rounded-lg border border-slate-300 bg-slate-50 p-4 sm:grid-cols-3">
              <Info
                title="Inventory"
                value={
                  editing.inventory
                    ?.inventory_code ??
                  `#${editing.store_inventory_id}`
                }
              />

              <Info
                title="Coffee Lot"
                value={
                  editing.coffee_lot
                    ?.lot_code ??
                  `#${editing.coffee_lot_id}`
                }
              />

              <Info
                title="Storage"
                value={
                  editing.source_storage_location
                }
              />
            </div>

            <Field label="Process Name">
              <input
                value={processName}
                onChange={(event) =>
                  setProcessName(
                    event.target.value,
                  )
                }
                className={inputClass}
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Input Quantity (Kg)">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    inputQuantity
                  }
                  onChange={(event) =>
                    setInputQuantity(
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Planned Start">
                <input
                  type="datetime-local"
                  value={
                    plannedStartAt
                  }
                  onChange={(event) =>
                    setPlannedStartAt(
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
            title={`Cancel ${cancelTarget.batch_code}`}
            subtitle={
              cancelTarget.status ===
              "in_progress"
                ? "The related Processing Issue will be reversed and the stock returned if no later movement exists."
                : "The draft batch will be cancelled without changing stock."
            }
            close={() =>
              setCancelTarget(null)
            }
          >
            {cancelTarget.status ===
              "in_progress" && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
                <p className="font-bold text-amber-950">
                  Stock to restore:{" "}
                  {formatNumber(
                    cancelTarget.input_quantity_kg,
                  )}{" "}
                  Kg
                </p>

                <p className="mt-1 text-xs font-medium text-amber-800">
                  Cancellation will fail
                  if later Stock
                  Movements already exist
                  for this Inventory.
                </p>
              </div>
            )}

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
                placeholder="Explain why this Processing Batch is being cancelled..."
                className={
                  textareaClass
                }
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
                Keep Batch
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
                  : "Cancel Batch"}
              </button>
            </div>
          </ModalCard>
        </Modal>
      )}

      {viewing && (
        <Modal>
          <ModalCard
            title={
              viewing.batch_code
            }
            subtitle="Processing Batch and Stock Movement traceability."
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
                title="Process"
                value={
                  viewing.process_name
                }
              />

              <Detail
                title="Input Quantity"
                value={`${formatNumber(
                  viewing.input_quantity_kg,
                )} Kg`}
              />

              <Detail
                title="Inventory"
                value={
                  viewing.inventory
                    ?.inventory_code ??
                  `#${viewing.store_inventory_id}`
                }
              />

              <Detail
                title="Coffee Lot"
                value={
                  viewing.coffee_lot
                    ?.lot_code ??
                  `#${viewing.coffee_lot_id}`
                }
              />

              <Detail
                title="Source Storage"
                value={
                  viewing.source_storage_location
                }
              />

              <Detail
                title="Planned Start"
                value={formatDateTime(
                  viewing.planned_start_at,
                )}
              />

              <Detail
                title="Started At"
                value={formatDateTime(
                  viewing.started_at,
                )}
              />

              <Detail
                title="Started By"
                value={
                  viewing.starter
                    ?.name ??
                  "—"
                }
              />

              <Detail
                title="Completed At"
                value={formatDateTime(
                  viewing.completed_at,
                )}
              />

              <Detail
                title="Completed By"
                value={
                  viewing.completer
                    ?.name ??
                  "—"
                }
              />

              <Detail
                title="Season"
                value={
                  viewing.season
                    ? `${viewing.season.name} · ${viewing.season.code}`
                    : "—"
                }
              />
            </div>

            {viewing.processing_issue_movement && (
              <div className="rounded-lg border border-[#d9c9ae] bg-[#fffaf2] p-4">
                <p className="text-xs font-extrabold uppercase text-[#80570f]">
                  Processing Stock Issue
                </p>

                <div className="mt-3 grid gap-4 sm:grid-cols-4">
                  <Info
                    title="Movement"
                    value={
                      viewing.processing_issue_movement
                        .movement_code
                    }
                  />

                  <Info
                    title="Before"
                    value={`${formatNumber(
                      viewing.processing_issue_movement
                        .quantity_before_kg,
                    )} Kg`}
                  />

                  <Info
                    title="Issued"
                    value={`${formatNumber(
                      viewing.processing_issue_movement
                        .quantity_kg,
                    )} Kg`}
                  />

                  <Info
                    title="After"
                    value={`${formatNumber(
                      viewing.processing_issue_movement
                        .quantity_after_kg,
                    )} Kg`}
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

function StatusBadge({
  status,
}: {
  status: ProcessingBatchStatus;
}) {
  const styles: Record<
    ProcessingBatchStatus,
    string
  > = {
    draft:
      "bg-slate-100 text-slate-800",

    in_progress:
      "bg-amber-100 text-amber-900",

    completed:
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
        {total} batches · Page{" "}
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
                page - 1,
                1,
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

function toDateTimeLocal(
  value?: string | null,
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  const offset =
    date.getTimezoneOffset();

  const local =
    new Date(
      date.getTime() -
        offset * 60_000,
    );

  return local
    .toISOString()
    .slice(0, 16);
}

function errorMessage(
  error: unknown,
) {
  return error instanceof Error
    ? error.message
    : "Something went wrong.";
}
