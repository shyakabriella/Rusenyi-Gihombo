"use client";

import {
  Boxes,
  Eye,
  LoaderCircle,
  MapPin,
  PackageCheck,
  Pencil,
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
  cancelStoreInventory,
  createStoreInventory,
  getEligibleCoffeeLots,
  getStoreInventories,
  getStoreInventory,
  getStoreInventoryRole,
  getStoreInventorySummary,
  updateStoreInventory,
} from "@/services/store-inventory-service";

import type {
  DashboardRole,
  EligibleCoffeeLot,
  StoreInventory,
  StoreInventoryStatus,
  StoreInventorySummary,
} from "@/types/store-inventory";

const inputClass =
  "h-11 w-full rounded-lg border border-slate-400 bg-white px-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-600 focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

const textareaClass =
  "min-h-24 w-full rounded-lg border border-slate-400 bg-white px-3 py-2.5 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-600 focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

const emptySummary: StoreInventorySummary = {
  active_inventory_records: 0,
  total_stock_kg: "0.00",
  total_initial_stock_kg: "0.00",
  total_bags: 0,
  storage_locations: 0,
  cancelled_records: 0,
};

export default function StoreInventoryManagement() {
  const [items, setItems] =
    useState<StoreInventory[]>([]);

  const [summary, setSummary] =
    useState<StoreInventorySummary>(
      emptySummary,
    );

  const [role, setRole] =
    useState<DashboardRole>("");

  const [eligibleLots, setEligibleLots] =
    useState<EligibleCoffeeLot[]>([]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [coffeeType, setCoffeeType] =
    useState("");

  const [filters, setFilters] =
    useState({
      search: "",
      status: "",
      coffeeType: "",
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
    useState<StoreInventory | null>(
      null,
    );

  const [editing, setEditing] =
    useState<StoreInventory | null>(
      null,
    );

  const [
    cancelTarget,
    setCancelTarget,
  ] =
    useState<StoreInventory | null>(
      null,
    );

  const [lotId, setLotId] =
    useState("");

  const [
    storageLocation,
    setStorageLocation,
  ] = useState("");

  const [bagCount, setBagCount] =
    useState("");

  const [
    receivedAt,
    setReceivedAt,
  ] = useState("");

  const [notes, setNotes] =
    useState("");

  const [
    cancellationReason,
    setCancellationReason,
  ] = useState("");

  const canManage =
    role === "admin";

  const selectedLot =
    useMemo(() => {
      return eligibleLots.find(
        (lot) =>
          lot.id ===
          Number(lotId),
      ) ?? null;
    }, [
      eligibleLots,
      lotId,
    ]);

  const load = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const [list, totals] =
          await Promise.all([
            getStoreInventories({
              search:
                filters.search ||
                undefined,

              status:
                filters.status
                  ? (
                      filters.status as StoreInventoryStatus
                    )
                  : undefined,

              coffee_type:
                filters.coffeeType ||
                undefined,

              page,
              per_page: 15,
            }),

            getStoreInventorySummary(),
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
          await getStoreInventoryRole();

        setRole(currentRole);

        if (
          currentRole === "admin"
        ) {
          const lots =
            await getEligibleCoffeeLots();

          setEligibleLots(lots);
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

  async function refreshEligibleLots() {
    if (!canManage) {
      return;
    }

    const lots =
      await getEligibleCoffeeLots();

    setEligibleLots(lots);
  }

  function applyFilters() {
    setFilters({
      search: search.trim(),
      status,
      coffeeType:
        coffeeType.trim(),
    });

    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setStatus("");
    setCoffeeType("");

    setFilters({
      search: "",
      status: "",
      coffeeType: "",
    });

    setPage(1);
  }

  async function openCreate() {
    setError("");
    setSuccess("");

    try {
      await refreshEligibleLots();

      setLotId("");
      setStorageLocation("");
      setBagCount("");
      setReceivedAt("");
      setNotes("");

      setCreateOpen(true);
    } catch (error) {
      setError(
        errorMessage(error),
      );
    }
  }

  async function submitCreate() {
    if (!lotId) {
      setError(
        "Select an eligible Coffee Lot.",
      );
      return;
    }

    if (!storageLocation.trim()) {
      setError(
        "Storage location is required.",
      );
      return;
    }

    if (
      bagCount &&
      Number(bagCount) < 0
    ) {
      setError(
        "Bag count cannot be negative.",
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      await createStoreInventory({
        coffee_lot_id:
          Number(lotId),

        storage_location:
          storageLocation.trim(),

        bag_count:
          bagCount
            ? Number(bagCount)
            : undefined,

        received_at:
          receivedAt ||
          undefined,

        notes:
          notes.trim() ||
          undefined,
      });

      setCreateOpen(false);

      setSuccess(
        "Coffee Lot received into store successfully.",
      );

      await Promise.all([
        load(),
        refreshEligibleLots(),
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
    inventory: StoreInventory,
  ) {
    try {
      const result =
        await getStoreInventory(
          inventory.id,
        );

      setViewing(result);
    } catch (error) {
      setError(
        errorMessage(error),
      );
    }
  }

  function openEdit(
    inventory: StoreInventory,
  ) {
    setEditing(inventory);

    setStorageLocation(
      inventory.storage_location,
    );

    setBagCount(
      inventory.bag_count !==
        null &&
      inventory.bag_count !==
        undefined
        ? String(
            inventory.bag_count,
          )
        : "",
    );

    setNotes(
      inventory.notes ?? "",
    );
  }

  async function submitEdit() {
    if (!editing) {
      return;
    }

    if (!storageLocation.trim()) {
      setError(
        "Storage location is required.",
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      await updateStoreInventory(
        editing.id,
        {
          storage_location:
            storageLocation.trim(),

          bag_count:
            bagCount
              ? Number(
                  bagCount,
                )
              : null,

          notes:
            notes.trim() ||
            null,
        },
      );

      setEditing(null);

      setSuccess(
        "Store inventory updated successfully.",
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
      await cancelStoreInventory(
        cancelTarget.id,
        cancellationReason.trim(),
      );

      setCancelTarget(null);
      setCancellationReason("");

      setSuccess(
        "Store receipt cancelled successfully.",
      );

      await Promise.all([
        load(),
        refreshEligibleLots(),
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
            Store / Inventory
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-700">
            Receive coffee lots into
            storage and monitor current
            coffee stock at the washing
            station.
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
            Receive Coffee Lot
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Current Stock"
          value={`${formatNumber(
            summary.total_stock_kg,
          )} Kg`}
          icon={
            <Weight size={19} />
          }
          green
        />

        <Metric
          title="Active Inventory"
          value={
            summary.active_inventory_records
          }
          icon={
            <Boxes size={19} />
          }
        />

        <Metric
          title="Total Bags"
          value={
            summary.total_bags
          }
          icon={
            <PackageCheck
              size={19}
            />
          }
        />

        <Metric
          title="Storage Locations"
          value={
            summary.storage_locations
          }
          icon={
            <Warehouse
              size={19}
            />
          }
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <MiniMetric
          title="Initial Received Stock"
          value={`${formatNumber(
            summary.total_initial_stock_kg,
          )} Kg`}
        />

        <MiniMetric
          title="Cancelled Receipts"
          value={String(
            summary.cancelled_records,
          )}
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
              placeholder="Search inventory, lot, coffee type or location..."
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

            <option value="active">
              Active
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
            placeholder="Coffee type"
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
          <table className="w-full min-w-[1250px]">
            <thead className="bg-[#f6f1e8]">
              <tr className="border-b border-slate-300 text-left text-xs font-extrabold uppercase text-slate-800">
                <th className="px-4 py-4">
                  Inventory
                </th>

                <th className="px-4 py-4">
                  Coffee Lot
                </th>

                <th className="px-4 py-4">
                  Coffee Type
                </th>

                <th className="px-4 py-4">
                  Initial Stock
                </th>

                <th className="px-4 py-4">
                  Current Stock
                </th>

                <th className="px-4 py-4">
                  Bags
                </th>

                <th className="px-4 py-4">
                  Storage Location
                </th>

                <th className="px-4 py-4">
                  Received
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
                  (inventory) => (
                    <tr
                      key={inventory.id}
                      className="border-b border-slate-200 text-sm hover:bg-[#fffdf8]"
                    >
                      <td className="px-4 py-4">
                        <p className="font-extrabold text-[#80570f]">
                          {
                            inventory.inventory_code
                          }
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-extrabold">
                          {inventory.coffee_lot
                            ?.lot_code ??
                            `Lot #${inventory.coffee_lot_id}`}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {label(
                            inventory.source_type,
                          )}
                        </p>
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {label(
                          inventory.coffee_type,
                        )}
                      </td>

                      <td className="px-4 py-4 font-semibold">
                        {formatNumber(
                          inventory.initial_quantity_kg,
                        )}{" "}
                        Kg
                      </td>

                      <td className="px-4 py-4 font-extrabold text-[#075b38]">
                        {formatNumber(
                          inventory.current_quantity_kg,
                        )}{" "}
                        Kg
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {inventory.bag_count ??
                          "—"}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin
                            size={15}
                            className="text-[#80570f]"
                          />

                          <span className="font-semibold">
                            {
                              inventory.storage_location
                            }
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {formatDateTime(
                          inventory.received_at,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          status={
                            inventory.status
                          }
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-2">
                          <IconButton
                            title="View"
                            onClick={() =>
                              void openView(
                                inventory,
                              )
                            }
                          >
                            <Eye size={15} />
                          </IconButton>

                          {canManage &&
                            inventory.status ===
                              "active" && (
                              <>
                                <IconButton
                                  title="Edit"
                                  onClick={() =>
                                    openEdit(
                                      inventory,
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
                                  onClick={() => {
                                    setCancelTarget(
                                      inventory,
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
                    <Warehouse
                      size={40}
                      className="mx-auto text-slate-400"
                    />

                    <p className="mt-3 font-bold">
                      No inventory
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
            title="Receive Coffee Lot"
            subtitle="Select an eligible Coffee Lot and record where it is stored."
            close={() =>
              setCreateOpen(
                false,
              )
            }
          >
            <Field label="Coffee Lot">
              <select
                value={lotId}
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setLotId(value);

                  const lot =
                    eligibleLots.find(
                      (item) =>
                        item.id ===
                        Number(value),
                    );

                  if (
                    lot?.bag_count !==
                      null &&
                    lot?.bag_count !==
                      undefined
                  ) {
                    setBagCount(
                      String(
                        lot.bag_count,
                      ),
                    );
                  }
                }}
                className={
                  inputClass
                }
              >
                <option value="">
                  Select Coffee Lot
                </option>

                {eligibleLots.map(
                  (lot) => (
                    <option
                      key={lot.id}
                      value={lot.id}
                    >
                      {lot.lot_code}
                      {" — "}
                      {label(
                        lot.coffee_type,
                      )}
                      {" — "}
                      {formatNumber(
                        lot.current_weight_kg,
                      )}
                      {" Kg"}
                    </option>
                  ),
                )}
              </select>
            </Field>

            {selectedLot && (
              <div className="grid gap-3 rounded-lg border border-[#d9c9ae] bg-[#fffaf2] p-4 sm:grid-cols-2 lg:grid-cols-4">
                <Info
                  title="Lot"
                  value={
                    selectedLot.lot_code
                  }
                />

                <Info
                  title="Coffee Type"
                  value={label(
                    selectedLot.coffee_type,
                  )}
                />

                <Info
                  title="Stock"
                  value={`${formatNumber(
                    selectedLot.current_weight_kg,
                  )} Kg`}
                />

                <Info
                  title="Bags"
                  value={
                    selectedLot.bag_count !==
                      null &&
                    selectedLot.bag_count !==
                      undefined
                      ? String(
                          selectedLot.bag_count,
                        )
                      : "—"
                  }
                />
              </div>
            )}

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-bold text-emerald-950">
                Stock quantity is
                controlled by the
                system.
              </p>

              <p className="mt-1 text-xs font-medium text-emerald-800">
                The initial and current
                stock are copied from
                the selected Coffee Lot.
                They cannot be entered
                manually here.
              </p>
            </div>

            <Field label="Storage Location">
              <input
                value={
                  storageLocation
                }
                onChange={(event) =>
                  setStorageLocation(
                    event.target.value,
                  )
                }
                placeholder="Example: Warehouse A / Zone 2"
                className={
                  inputClass
                }
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Bag Count">
                <input
                  type="number"
                  min="0"
                  value={bagCount}
                  onChange={(event) =>
                    setBagCount(
                      event.target.value,
                    )
                  }
                  className={
                    inputClass
                  }
                />
              </Field>

              <Field label="Received At">
                <input
                  type="datetime-local"
                  value={receivedAt}
                  onChange={(event) =>
                    setReceivedAt(
                      event.target.value,
                    )
                  }
                  className={
                    inputClass
                  }
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
                placeholder="Optional store receipt notes..."
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
              text="Receive Into Store"
            />
          </ModalCard>
        </Modal>
      )}

      {editing && (
        <Modal>
          <ModalCard
            title={`Edit ${editing.inventory_code}`}
            subtitle="Storage details can be updated. Stock quantity remains locked."
            close={() =>
              setEditing(null)
            }
          >
            <div className="grid gap-3 rounded-lg border border-slate-300 bg-slate-50 p-4 sm:grid-cols-2">
              <Info
                title="Coffee Lot"
                value={
                  editing.coffee_lot
                    ?.lot_code ??
                  `#${editing.coffee_lot_id}`
                }
              />

              <Info
                title="Current Stock"
                value={`${formatNumber(
                  editing.current_quantity_kg,
                )} Kg`}
              />
            </div>

            <Field label="Storage Location">
              <input
                value={
                  storageLocation
                }
                onChange={(event) =>
                  setStorageLocation(
                    event.target.value,
                  )
                }
                className={
                  inputClass
                }
              />
            </Field>

            <Field label="Bag Count">
              <input
                type="number"
                min="0"
                value={bagCount}
                onChange={(event) =>
                  setBagCount(
                    event.target.value,
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
            title={`Cancel ${cancelTarget.inventory_code}`}
            subtitle="The record will stay in the audit history and the Coffee Lot will return to Received stage."
            close={() =>
              setCancelTarget(
                null,
              )
            }
          >
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
              <p className="font-bold text-amber-950">
                Current stock:{" "}
                {formatNumber(
                  cancelTarget.current_quantity_kg,
                )}{" "}
                Kg
              </p>

              <p className="mt-1 text-xs font-medium text-amber-800">
                Cancellation will be
                rejected if stock
                movements have already
                changed this quantity.
              </p>
            </div>

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
                placeholder="Explain why this store receipt is being cancelled..."
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
                Keep Receipt
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
                  : "Cancel Receipt"}
              </button>
            </div>
          </ModalCard>
        </Modal>
      )}

      {viewing && (
        <Modal>
          <ModalCard
            title={
              viewing.inventory_code
            }
            subtitle="Store inventory and coffee lot traceability."
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
                title="Coffee Lot"
                value={
                  viewing.coffee_lot
                    ?.lot_code ??
                  `#${viewing.coffee_lot_id}`
                }
              />

              <Detail
                title="Coffee Type"
                value={label(
                  viewing.coffee_type,
                )}
              />

              <Detail
                title="Initial Stock"
                value={`${formatNumber(
                  viewing.initial_quantity_kg,
                )} Kg`}
              />

              <Detail
                title="Current Stock"
                value={`${formatNumber(
                  viewing.current_quantity_kg,
                )} Kg`}
              />

              <Detail
                title="Bag Count"
                value={
                  viewing.bag_count !==
                    null &&
                  viewing.bag_count !==
                    undefined
                    ? String(
                        viewing.bag_count,
                      )
                    : "—"
                }
              />

              <Detail
                title="Storage Location"
                value={
                  viewing.storage_location
                }
              />

              <Detail
                title="Received At"
                value={formatDateTime(
                  viewing.received_at,
                )}
              />

              <Detail
                title="Received By"
                value={
                  viewing.receiver
                    ?.name ??
                  "—"
                }
              />

              <Detail
                title="Source"
                value={label(
                  viewing.source_type,
                )}
              />

              <Detail
                title="Source ID"
                value={String(
                  viewing.source_id,
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

function StatusBadge({
  status,
}: {
  status: StoreInventoryStatus;
}) {
  const styles: Record<
    StoreInventoryStatus,
    string
  > = {
    active:
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
