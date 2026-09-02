"use client";

import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Eye,
  LoaderCircle,
  PackageOpen,
  Plus,
  RotateCcw,
  Search,
  Warehouse,
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
  createStockMovement,
  getStockInventoryLookup,
  getStockMovement,
  getStockMovementRole,
  getStockMovements,
  getStockMovementSummary,
  reverseStockMovement,
} from "@/services/stock-movement-service";

import type {
  DashboardRole,
  StockMovement,
  StockMovementInventory,
  StockMovementStatus,
  StockMovementSummary,
  StockMovementType,
} from "@/types/stock-movement";

const inputClass =
  "h-11 w-full rounded-lg border border-slate-400 bg-white px-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-600 focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

const textareaClass =
  "min-h-24 w-full rounded-lg border border-slate-400 bg-white px-3 py-2.5 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-600 focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

const emptySummary: StockMovementSummary = {
  total_movements: 0,
  stock_in_kg: "0.00",
  stock_out_kg: "0.00",
  processing_issued_kg: "0.00",
  transfers: 0,
  reversals: 0,
  current_stock_kg: "0.00",
};

type ManualMovementType =
  | "stock_in"
  | "stock_out"
  | "adjustment_in"
  | "adjustment_out"
  | "transfer";

export default function StockMovementManagement() {
  const [items, setItems] =
    useState<StockMovement[]>([]);

  const [summary, setSummary] =
    useState<StockMovementSummary>(
      emptySummary,
    );

  const [inventories, setInventories] =
    useState<StockMovementInventory[]>([]);

  const [role, setRole] =
    useState<DashboardRole>("");

  const [search, setSearch] =
    useState("");

  const [movementType, setMovementType] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");

  const [filters, setFilters] =
    useState({
      search: "",
      movementType: "",
      status: "",
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

  const [viewing, setViewing] =
    useState<StockMovement | null>(
      null,
    );

  const [
    reverseTarget,
    setReverseTarget,
  ] = useState<StockMovement | null>(
    null,
  );

  const [inventoryId, setInventoryId] =
    useState("");

  const [formType, setFormType] =
    useState<ManualMovementType>(
      "stock_out",
    );

  const [quantity, setQuantity] =
    useState("");

  const [
    destinationLocation,
    setDestinationLocation,
  ] = useState("");

  const [
    referenceType,
    setReferenceType,
  ] = useState("");

  const [referenceId, setReferenceId] =
    useState("");

  const [reason, setReason] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [
    reversalReason,
    setReversalReason,
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

  const isTransfer =
    formType === "transfer";

  const load = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const [list, totals] =
          await Promise.all([
            getStockMovements({
              search:
                filters.search ||
                undefined,

              movement_type:
                filters.movementType
                  ? (
                      filters.movementType as StockMovementType
                    )
                  : undefined,

              status:
                filters.status
                  ? (
                      filters.status as StockMovementStatus
                    )
                  : undefined,

              date_from:
                filters.dateFrom ||
                undefined,

              date_to:
                filters.dateTo ||
                undefined,

              page,
              per_page: 15,
            }),

            getStockMovementSummary(),
          ]);

        setItems(list.items);
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
      filters,
      page,
    ],
  );

  useEffect(() => {
    async function prepare() {
      try {
        const currentRole =
          await getStockMovementRole();

        setRole(currentRole);

        if (
          currentRole === "admin"
        ) {
          const lookup =
            await getStockInventoryLookup();

          setInventories(lookup);
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
      await getStockInventoryLookup(),
    );
  }

  function applyFilters() {
    setFilters({
      search:
        search.trim(),

      movementType,

      status,

      dateFrom,

      dateTo,
    });

    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setMovementType("");
    setStatus("");
    setDateFrom("");
    setDateTo("");

    setFilters({
      search: "",
      movementType: "",
      status: "",
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
      setFormType("stock_out");
      setQuantity("");
      setDestinationLocation("");
      setReferenceType("");
      setReferenceId("");
      setReason("");
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
        "Select a Store Inventory record.",
      );
      return;
    }

    if (!reason.trim()) {
      setError(
        "Reason is required.",
      );
      return;
    }

    if (
      isTransfer &&
      !destinationLocation.trim()
    ) {
      setError(
        "Destination location is required for a transfer.",
      );
      return;
    }

    if (!isTransfer) {
      const quantityValue =
        Number(quantity);

      if (
        !Number.isFinite(
          quantityValue,
        ) ||
        quantityValue <= 0
      ) {
        setError(
          "Quantity must be greater than zero.",
        );
        return;
      }

      if (
        selectedInventory &&
        (
          formType === "stock_out" ||
          formType ===
            "adjustment_out"
        ) &&
        quantityValue >
          Number(
            selectedInventory.current_quantity_kg,
          )
      ) {
        setError(
          "Quantity cannot exceed the available stock.",
        );
        return;
      }
    }

    setBusy(true);
    setError("");

    try {
      await createStockMovement({
        store_inventory_id:
          Number(inventoryId),

        movement_type:
          formType,

        quantity_kg:
          isTransfer
            ? undefined
            : Number(quantity),

        to_location:
          isTransfer
            ? destinationLocation.trim()
            : undefined,

        reference_type:
          referenceType.trim() ||
          undefined,

        reference_id:
          referenceId
            ? Number(referenceId)
            : undefined,

        reason:
          reason.trim(),

        notes:
          notes.trim() ||
          undefined,
      });

      setCreateOpen(false);

      setSuccess(
        "Stock Movement posted successfully.",
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

  async function openView(
    movement: StockMovement,
  ) {
    try {
      setViewing(
        await getStockMovement(
          movement.id,
        ),
      );
    } catch (error) {
      setError(
        errorMessage(error),
      );
    }
  }

  async function submitReverse() {
    if (!reverseTarget) {
      return;
    }

    if (
      reversalReason
        .trim()
        .length < 3
    ) {
      setError(
        "Reversal reason is required.",
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      await reverseStockMovement(
        reverseTarget.id,
        reversalReason.trim(),
      );

      setReverseTarget(null);
      setReversalReason("");

      setSuccess(
        "Stock Movement reversed successfully.",
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
            Stock Movements
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-700">
            Track every movement that
            changes coffee stock or
            transfers coffee between
            storage locations.
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
            New Movement
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Current Stock"
          value={`${formatNumber(
            summary.current_stock_kg,
          )} Kg`}
          icon={
            <Warehouse size={19} />
          }
          green
        />

        <Metric
          title="Stock In"
          value={`${formatNumber(
            summary.stock_in_kg,
          )} Kg`}
          icon={
            <ArrowDownToLine
              size={19}
            />
          }
        />

        <Metric
          title="Stock Out"
          value={`${formatNumber(
            summary.stock_out_kg,
          )} Kg`}
          icon={
            <ArrowUpFromLine
              size={19}
            />
          }
        />

        <Metric
          title="Processing Issued"
          value={`${formatNumber(
            summary.processing_issued_kg,
          )} Kg`}
          icon={
            <PackageOpen
              size={19}
            />
          }
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <MiniMetric
          title="Total Movements"
          value={String(
            summary.total_movements,
          )}
        />

        <MiniMetric
          title="Transfers"
          value={String(
            summary.transfers,
          )}
        />

        <MiniMetric
          title="Reversals"
          value={String(
            summary.reversals,
          )}
        />
      </div>

      <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1fr_180px_160px_160px_160px_auto_auto]">
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
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  applyFilters();
                }
              }}
              placeholder="Search movement, inventory, lot, location..."
              className="h-11 w-full rounded-lg border border-slate-400 bg-white pl-9 pr-3 text-sm font-medium outline-none placeholder:text-slate-600 focus:border-[#075b38]"
            />
          </div>

          <select
            value={movementType}
            onChange={(event) =>
              setMovementType(
                event.target.value,
              )
            }
            className={inputClass}
          >
            <option value="">
              All Types
            </option>

            <option value="stock_in">
              Stock In
            </option>

            <option value="stock_out">
              Stock Out
            </option>

            <option value="adjustment_in">
              Adjustment In
            </option>

            <option value="adjustment_out">
              Adjustment Out
            </option>

            <option value="processing_issue">
              Processing Issue
            </option>

            <option value="transfer">
              Transfer
            </option>

            <option value="reversal">
              Reversal
            </option>
          </select>

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

            <option value="posted">
              Posted
            </option>

            <option value="reversed">
              Reversed
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
                  Movement
                </th>

                <th className="px-4 py-4">
                  Inventory / Lot
                </th>

                <th className="px-4 py-4">
                  Type
                </th>

                <th className="px-4 py-4">
                  Before
                </th>

                <th className="px-4 py-4">
                  Quantity
                </th>

                <th className="px-4 py-4">
                  After
                </th>

                <th className="px-4 py-4">
                  Location
                </th>

                <th className="px-4 py-4">
                  Posted By
                </th>

                <th className="px-4 py-4">
                  Posted At
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
                  (movement) => (
                    <tr
                      key={movement.id}
                      className="border-b border-slate-200 text-sm hover:bg-[#fffdf8]"
                    >
                      <td className="px-4 py-4">
                        <p className="font-extrabold text-[#80570f]">
                          {
                            movement.movement_code
                          }
                        </p>

                        <p className="mt-1 max-w-[180px] truncate text-xs text-slate-600">
                          {
                            movement.reason
                          }
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-bold">
                          {movement.inventory
                            ?.inventory_code ??
                            `INV #${movement.store_inventory_id}`}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {movement.coffee_lot
                            ?.lot_code ??
                            `LOT #${movement.coffee_lot_id}`}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <TypeBadge
                          type={
                            movement.movement_type
                          }
                        />
                      </td>

                      <td className="px-4 py-4 font-semibold">
                        {formatNumber(
                          movement.quantity_before_kg,
                        )}{" "}
                        Kg
                      </td>

                      <td className="px-4 py-4 font-extrabold">
                        {movement.movement_type ===
                        "transfer"
                          ? "—"
                          : `${formatNumber(
                              movement.quantity_kg,
                            )} Kg`}
                      </td>

                      <td className="px-4 py-4 font-extrabold text-[#075b38]">
                        {formatNumber(
                          movement.quantity_after_kg,
                        )}{" "}
                        Kg
                      </td>

                      <td className="px-4 py-4">
                        {movement.movement_type ===
                        "transfer" ? (
                          <div>
                            <p className="text-xs text-slate-600">
                              {
                                movement.from_location
                              }
                            </p>

                            <p className="font-bold">
                              ↓{" "}
                              {
                                movement.to_location
                              }
                            </p>
                          </div>
                        ) : (
                          movement.inventory
                            ?.storage_location ??
                          movement.to_location ??
                          movement.from_location ??
                          "—"
                        )}
                      </td>

                      <td className="px-4 py-4 font-semibold">
                        {movement.poster
                          ?.name ??
                          "—"}
                      </td>

                      <td className="px-4 py-4">
                        {formatDateTime(
                          movement.posted_at,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          status={
                            movement.status
                          }
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-2">
                          <IconButton
                            title="View"
                            onClick={() =>
                              void openView(
                                movement,
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
                            movement.status ===
                              "posted" &&
                            movement.movement_type !==
                              "reversal" && (
                              <IconButton
                                title="Reverse"
                                onClick={() => {
                                  setReverseTarget(
                                    movement,
                                  );

                                  setReversalReason(
                                    "",
                                  );
                                }}
                              >
                                <RotateCcw
                                  size={
                                    15
                                  }
                                />
                              </IconButton>
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
                    <ArrowLeftRight
                      size={40}
                      className="mx-auto text-slate-400"
                    />

                    <p className="mt-3 font-bold">
                      No Stock Movements
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
            title="New Stock Movement"
            subtitle="Stock quantity is calculated and updated by the backend."
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
                  Select inventory
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
                      {" Kg — "}
                      {
                        inventory.storage_location
                      }
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

            <Field label="Movement Type">
              <select
                value={formType}
                onChange={(event) => {
                  const value =
                    event.target
                      .value as ManualMovementType;

                  setFormType(value);

                  if (
                    value ===
                    "transfer"
                  ) {
                    setQuantity("");
                  } else {
                    setDestinationLocation(
                      "",
                    );
                  }
                }}
                className={inputClass}
              >
                <option value="stock_in">
                  Stock In
                </option>

                <option value="stock_out">
                  Stock Out
                </option>

                <option value="adjustment_in">
                  Adjustment In
                </option>

                <option value="adjustment_out">
                  Adjustment Out
                </option>

                <option value="transfer">
                  Storage Transfer
                </option>
              </select>
            </Field>

            {isTransfer ? (
              <Field label="Destination Storage Location">
                <input
                  value={
                    destinationLocation
                  }
                  onChange={(event) =>
                    setDestinationLocation(
                      event.target.value,
                    )
                  }
                  placeholder="Example: Warehouse B / Zone 3"
                  className={inputClass}
                />
              </Field>
            ) : (
              <Field label="Quantity (Kg)">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(
                      event.target.value,
                    )
                  }
                  placeholder="0.00"
                  className={inputClass}
                />
              </Field>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Reference Type">
                <input
                  value={
                    referenceType
                  }
                  onChange={(event) =>
                    setReferenceType(
                      event.target.value,
                    )
                  }
                  placeholder="Optional"
                  className={inputClass}
                />
              </Field>

              <Field label="Reference ID">
                <input
                  type="number"
                  min="1"
                  value={
                    referenceId
                  }
                  onChange={(event) =>
                    setReferenceId(
                      event.target.value,
                    )
                  }
                  placeholder="Optional"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Reason">
              <textarea
                value={reason}
                onChange={(event) =>
                  setReason(
                    event.target.value,
                  )
                }
                placeholder="Why is this stock movement being posted?"
                className={textareaClass}
              />
            </Field>

            <Field label="Notes">
              <textarea
                value={notes}
                onChange={(event) =>
                  setNotes(
                    event.target.value,
                  )
                }
                placeholder="Optional notes..."
                className={textareaClass}
              />
            </Field>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-bold text-emerald-950">
                Stock balance is not
                entered manually.
              </p>

              <p className="mt-1 text-xs font-medium text-emerald-800">
                The backend calculates
                the before and after
                quantities and updates
                both Inventory and the
                Coffee Lot.
              </p>
            </div>

            <Actions
              busy={busy}
              cancel={() =>
                setCreateOpen(false)
              }
              submit={() =>
                void submitCreate()
              }
              text="Post Movement"
            />
          </ModalCard>
        </Modal>
      )}

      {reverseTarget && (
        <Modal>
          <ModalCard
            title={`Reverse ${reverseTarget.movement_code}`}
            subtitle="The original movement remains in history. A new reversal movement will be created."
            close={() =>
              setReverseTarget(null)
            }
          >
            <div className="grid gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 sm:grid-cols-3">
              <Info
                title="Type"
                value={label(
                  reverseTarget.movement_type,
                )}
              />

              <Info
                title="Before"
                value={`${formatNumber(
                  reverseTarget.quantity_before_kg,
                )} Kg`}
              />

              <Info
                title="After"
                value={`${formatNumber(
                  reverseTarget.quantity_after_kg,
                )} Kg`}
              />
            </div>

            <Field label="Reversal Reason">
              <textarea
                value={
                  reversalReason
                }
                onChange={(event) =>
                  setReversalReason(
                    event.target.value,
                  )
                }
                placeholder="Explain why this Stock Movement must be reversed..."
                className={textareaClass}
              />
            </Field>

            <div className="flex justify-end gap-2 border-t border-slate-300 pt-4">
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  setReverseTarget(null)
                }
                className="h-10 rounded-lg border border-slate-400 px-4 text-sm font-bold"
              >
                Keep Movement
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void submitReverse()
                }
                className="h-10 rounded-lg bg-red-700 px-5 text-sm font-bold text-white disabled:opacity-50"
              >
                {busy
                  ? "Reversing..."
                  : "Reverse Movement"}
              </button>
            </div>
          </ModalCard>
        </Modal>
      )}

      {viewing && (
        <Modal>
          <ModalCard
            title={
              viewing.movement_code
            }
            subtitle="Stock Movement details and inventory traceability."
            close={() =>
              setViewing(null)
            }
          >
            <div className="grid gap-x-6 md:grid-cols-3">
              <Detail
                title="Type"
                value={label(
                  viewing.movement_type,
                )}
              />

              <Detail
                title="Status"
                value={label(
                  viewing.status,
                )}
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
                title="Before"
                value={`${formatNumber(
                  viewing.quantity_before_kg,
                )} Kg`}
              />

              <Detail
                title="Quantity"
                value={
                  viewing.movement_type ===
                  "transfer"
                    ? "No quantity change"
                    : `${formatNumber(
                        viewing.quantity_kg,
                      )} Kg`
                }
              />

              <Detail
                title="After"
                value={`${formatNumber(
                  viewing.quantity_after_kg,
                )} Kg`}
              />

              <Detail
                title="From Location"
                value={
                  viewing.from_location ??
                  "—"
                }
              />

              <Detail
                title="To Location"
                value={
                  viewing.to_location ??
                  "—"
                }
              />

              <Detail
                title="Posted By"
                value={
                  viewing.poster?.name ??
                  "—"
                }
              />

              <Detail
                title="Posted At"
                value={formatDateTime(
                  viewing.posted_at,
                )}
              />

              <Detail
                title="Season"
                value={
                  viewing.season
                    ? `${viewing.season.name} · ${viewing.season.code}`
                    : "—"
                }
              />

              <Detail
                title="Reference Type"
                value={
                  viewing.reference_type ??
                  "—"
                }
              />

              <Detail
                title="Reference ID"
                value={
                  viewing.reference_id
                    ? String(
                        viewing.reference_id,
                      )
                    : "—"
                }
              />
            </div>

            <TextBlock
              title="Reason"
              text={
                viewing.reason
              }
            />

            {viewing.notes && (
              <TextBlock
                title="Notes"
                text={
                  viewing.notes
                }
              />
            )}

            {viewing.status ===
              "reversed" && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-4">
                <p className="text-xs font-extrabold uppercase text-red-800">
                  Reversal
                </p>

                <p className="mt-2 text-sm font-semibold text-red-900">
                  {viewing.reversal_reason ??
                    "No reversal reason recorded."}
                </p>

                <p className="mt-2 text-xs font-medium text-red-800">
                  Reversed by:{" "}
                  {viewing.reverser
                    ?.name ??
                    "—"}{" "}
                  ·{" "}
                  {formatDateTime(
                    viewing.reversed_at,
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

function TypeBadge({
  type,
}: {
  type: StockMovementType;
}) {
  const styles: Record<
    StockMovementType,
    string
  > = {
    stock_in:
      "bg-emerald-100 text-emerald-900",

    stock_out:
      "bg-red-100 text-red-900",

    adjustment_in:
      "bg-blue-100 text-blue-900",

    adjustment_out:
      "bg-amber-100 text-amber-900",

    processing_issue:
      "bg-purple-100 text-purple-900",

    transfer:
      "bg-cyan-100 text-cyan-900",

    reversal:
      "bg-slate-200 text-slate-900",
  };

  return (
    <span
      className={`rounded-md px-2.5 py-1 text-xs font-extrabold ${styles[type]}`}
    >
      {label(type)}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: StockMovementStatus;
}) {
  const className =
    status === "posted"
      ? "bg-emerald-100 text-emerald-900"
      : "bg-red-100 text-red-900";

  return (
    <span
      className={`rounded-md px-2.5 py-1 text-xs font-extrabold ${className}`}
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
        {total} movements · Page{" "}
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
