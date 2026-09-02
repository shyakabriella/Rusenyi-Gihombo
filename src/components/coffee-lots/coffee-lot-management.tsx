"use client";

import {
  Boxes,
  Eye,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  X,
} from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  closeCoffeeLot,
  createCoffeeLot,
  getCoffeeLot,
  getCoffeeLotDashboardRole,
  getCoffeeLots,
  getCoffeeLotSources,
  getCoffeeLotSummary,
  updateCoffeeLot,
} from "@/services/coffee-lot-service";

import {
  getActiveCoffeeSeasonForAllocation,
} from "@/services/cash-allocation-service";

import type {
  ActiveCoffeeSeason,
} from "@/types/cash-allocation";

import type {
  CoffeeLot,
  CoffeeLotSource,
  CoffeeLotSourceType,
  CoffeeLotStatus,
  CoffeeLotSummary,
  DashboardRole,
} from "@/types/coffee-lot";

const emptySummary: CoffeeLotSummary = {
  total_lots: 0,
  active_lots: 0,
  closed_lots: 0,
  initial_weight_kg: "0.00",
  current_weight_kg: "0.00",
};

const inputClass =
  "h-11 w-full rounded-lg border border-slate-400 bg-white px-3 text-sm font-medium text-slate-950 outline-none focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

const textareaClass =
  "min-h-24 w-full rounded-lg border border-slate-400 bg-white px-3 py-2.5 text-sm font-medium text-slate-950 outline-none focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

export default function CoffeeLotManagement() {
  const [lots, setLots] =
    useState<CoffeeLot[]>([]);

  const [summary, setSummary] =
    useState<CoffeeLotSummary>(
      emptySummary,
    );

  const [season, setSeason] =
    useState<ActiveCoffeeSeason | null>(
      null,
    );

  const [role, setRole] =
    useState<DashboardRole>("");

  const [sources, setSources] =
    useState<CoffeeLotSource[]>([]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [sourceType, setSourceType] =
    useState("");

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

  const [viewing, setViewing] =
    useState<CoffeeLot | null>(null);

  const [editing, setEditing] =
    useState<CoffeeLot | null>(null);

  const [createOpen, setCreateOpen] =
    useState(false);

  const [source, setSource] =
    useState("");

  const [bagCount, setBagCount] =
    useState("");

  const [
    storageLocation,
    setStorageLocation,
  ] = useState("");

  const [lotDate, setLotDate] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const canManage =
    role === "admin";

  const load = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const [list, totals] =
          await Promise.all([
            getCoffeeLots({
              search:
                search.trim() ||
                undefined,

              status:
                status
                  ? (
                      status as CoffeeLotStatus
                    )
                  : undefined,

              source_type:
                sourceType
                  ? (
                      sourceType as CoffeeLotSourceType
                    )
                  : undefined,

              coffee_season_id:
                season?.id,

              page,
              per_page: 15,
            }),

            getCoffeeLotSummary(
              season?.id,
            ),
          ]);

        setLots(list.items);
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
          message(error),
        );
      } finally {
        setLoading(false);
      }
    },
    [
      page,
      search,
      season?.id,
      sourceType,
      status,
    ],
  );

  useEffect(() => {
    async function prepare() {
      try {
        const [
          currentRole,
          activeSeason,
        ] = await Promise.all([
          getCoffeeLotDashboardRole(),
          getActiveCoffeeSeasonForAllocation(),
        ]);

        setRole(currentRole);
        setSeason(activeSeason);

        if (
          currentRole === "admin"
        ) {
          setSources(
            await getCoffeeLotSources(),
          );
        }
      } catch (error) {
        setError(
          message(error),
        );
      }
    }

    void prepare();
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function resetForm() {
    setSource("");
    setBagCount("");
    setStorageLocation("");
    setLotDate(today());
    setNotes("");
  }

  async function openCreate() {
    try {
      setSources(
        await getCoffeeLotSources(),
      );

      resetForm();
      setCreateOpen(true);
    } catch (error) {
      setError(
        message(error),
      );
    }
  }

  async function submitCreate() {
    const selected =
      sources.find(
        (item) =>
          sourceKey(item) === source,
      );

    if (!selected) {
      setError(
        "Please select a coffee source.",
      );
      return;
    }

    if (!lotDate) {
      setError(
        "Lot date is required.",
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      await createCoffeeLot({
        source_type:
          selected.source_type,

        source_id:
          selected.source_id,

        bag_count:
          bagCount
            ? Number(bagCount)
            : undefined,

        storage_location:
          storageLocation.trim()
          || undefined,

        lot_date:
          lotDate,

        notes:
          notes.trim()
          || undefined,
      });

      setCreateOpen(false);

      setSuccess(
        "Coffee lot created successfully.",
      );

      setSources(
        await getCoffeeLotSources(),
      );

      await load();
    } catch (error) {
      setError(
        message(error),
      );
    } finally {
      setBusy(false);
    }
  }

  async function openDetails(
    lot: CoffeeLot,
  ) {
    try {
      setViewing(
        await getCoffeeLot(
          lot.id,
        ),
      );
    } catch (error) {
      setError(
        message(error),
      );
    }
  }

  function openEdit(
    lot: CoffeeLot,
  ) {
    setEditing(lot);

    setBagCount(
      lot.bag_count
        ? String(lot.bag_count)
        : "",
    );

    setStorageLocation(
      lot.storage_location ?? "",
    );

    setNotes(
      lot.notes ?? "",
    );
  }

  async function submitEdit() {
    if (!editing) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await updateCoffeeLot(
        editing.id,
        {
          bag_count:
            bagCount
              ? Number(bagCount)
              : undefined,

          storage_location:
            storageLocation.trim()
            || undefined,

          notes:
            notes.trim()
            || undefined,
        },
      );

      setEditing(null);

      setSuccess(
        "Coffee lot updated successfully.",
      );

      await load();
    } catch (error) {
      setError(
        message(error),
      );
    } finally {
      setBusy(false);
    }
  }

  async function closeLot(
    lot: CoffeeLot,
  ) {
    if (
      !window.confirm(
        `Close ${lot.lot_code}?`,
      )
    ) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await closeCoffeeLot(
        lot.id,
      );

      setSuccess(
        `${lot.lot_code} closed successfully.`,
      );

      await load();
    } catch (error) {
      setError(
        message(error),
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
            Coffee Lots / Batches
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-700">
            Track coffee from reception
            through storage and processing.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() =>
              void openCreate()
            }
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white hover:bg-[#064a2f]"
          >
            <Plus size={17} />
            Create Coffee Lot
          </button>
        )}
      </div>

      <div className="rounded-xl border border-[#d9c9ae] bg-[#fffaf2] px-4 py-3">
        <p className="text-xs font-extrabold uppercase text-[#80570f]">
          Active Coffee Season
        </p>

        <p className="mt-1 font-bold">
          {season
            ? `${season.name} · ${season.code}`
            : "No active coffee season"}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Total Lots"
          value={String(
            summary.total_lots,
          )}
        />

        <Metric
          title="Active Lots"
          value={String(
            summary.active_lots,
          )}
          green
        />

        <Metric
          title="Received Weight"
          value={`${formatNumber(
            summary.initial_weight_kg,
          )} Kg`}
        />

        <Metric
          title="Current Weight"
          value={`${formatNumber(
            summary.current_weight_kg,
          )} Kg`}
          green
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4">
          <p className="text-xs font-extrabold uppercase text-emerald-900">
            Active
          </p>

          <p className="mt-1 text-2xl font-extrabold text-emerald-950">
            {summary.active_lots}
          </p>
        </div>

        <div className="rounded-xl border border-slate-300 bg-slate-100 p-4">
          <p className="text-xs font-extrabold uppercase text-slate-800">
            Closed
          </p>

          <p className="mt-1 text-2xl font-extrabold">
            {summary.closed_lots}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700"
            />

            <input
              value={search}
              onChange={(event) => {
                setSearch(
                  event.target.value,
                );
                setPage(1);
              }}
              placeholder="Search lot or storage..."
              className="h-11 w-full rounded-lg border border-slate-400 bg-white pl-9 pr-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-600 focus:border-[#075b38]"
            />
          </div>

          <select
            value={status}
            onChange={(event) => {
              setStatus(
                event.target.value,
              );
              setPage(1);
            }}
            className={inputClass}
          >
            <option value="">
              All Statuses
            </option>

            <option value="active">
              Active
            </option>

            <option value="closed">
              Closed
            </option>
          </select>

          <select
            value={sourceType}
            onChange={(event) => {
              setSourceType(
                event.target.value,
              );
              setPage(1);
            }}
            className={inputClass}
          >
            <option value="">
              All Sources
            </option>

            <option value="factory_reception">
              Factory Reception
            </option>

            <option value="direct_farmer_delivery">
              Direct Farmer Delivery
            </option>
          </select>

          <button
            type="button"
            onClick={() =>
              void load()
            }
            className="h-11 rounded-lg bg-[#075b38] px-4 text-sm font-bold text-white"
          >
            Apply
          </button>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatus("");
              setSourceType("");
              setPage(1);
            }}
            className="h-11 rounded-lg border border-slate-400 bg-white px-4 text-sm font-bold hover:bg-slate-100"
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
          <table className="w-full min-w-[1150px]">
            <thead className="bg-[#f6f1e8]">
              <tr className="border-b border-slate-300 text-left text-xs font-extrabold uppercase text-slate-800">
                <th className="px-4 py-4">
                  Lot
                </th>

                <th className="px-4 py-4">
                  Source
                </th>

                <th className="px-4 py-4">
                  Coffee Type
                </th>

                <th className="px-4 py-4">
                  Initial
                </th>

                <th className="px-4 py-4">
                  Current
                </th>

                <th className="px-4 py-4">
                  Bags
                </th>

                <th className="px-4 py-4">
                  Storage
                </th>

                <th className="px-4 py-4">
                  Stage
                </th>

                <th className="px-4 py-4">
                  Status
                </th>

                <th className="px-4 py-4">
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
              ) : lots.length ? (
                lots.map((lot) => (
                  <tr
                    key={lot.id}
                    className="border-b border-slate-200 text-sm text-slate-900 hover:bg-[#fffdf8]"
                  >
                    <td className="px-4 py-4">
                      <p className="font-extrabold text-[#80570f]">
                        {lot.lot_code}
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-700">
                        {formatDate(
                          lot.lot_date,
                        )}
                      </p>
                    </td>

                    <td className="px-4 py-4 font-semibold">
                      {label(
                        lot.source_type,
                      )}
                    </td>

                    <td className="px-4 py-4 font-bold">
                      {label(
                        lot.coffee_type,
                      )}
                    </td>

                    <td className="px-4 py-4 font-semibold">
                      {formatNumber(
                        lot.initial_weight_kg,
                      )}{" "}
                      Kg
                    </td>

                    <td className="px-4 py-4 font-extrabold">
                      {formatNumber(
                        lot.current_weight_kg,
                      )}{" "}
                      Kg
                    </td>

                    <td className="px-4 py-4">
                      {lot.bag_count ??
                        "—"}
                    </td>

                    <td className="px-4 py-4 font-semibold">
                      {lot.storage_location ??
                        "—"}
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-md bg-[#f6f1e8] px-2 py-1 text-xs font-bold text-[#684717]">
                        {label(
                          lot.processing_stage,
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <Status
                        value={
                          lot.status
                        }
                      />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <SmallButton
                          title="View"
                          onClick={() =>
                            void openDetails(
                              lot,
                            )
                          }
                        >
                          <Eye size={15} />
                        </SmallButton>

                        {canManage &&
                          lot.status ===
                            "active" && (
                            <>
                              <SmallButton
                                title="Edit"
                                onClick={() =>
                                  openEdit(
                                    lot,
                                  )
                                }
                              >
                                <Pencil
                                  size={
                                    15
                                  }
                                />
                              </SmallButton>

                              <button
                                type="button"
                                disabled={
                                  busy
                                }
                                onClick={() =>
                                  void closeLot(
                                    lot,
                                  )
                                }
                                className="h-9 rounded-lg border border-red-300 px-3 text-xs font-bold text-red-800 hover:bg-red-50"
                              >
                                Close
                              </button>
                            </>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="py-16 text-center"
                  >
                    <Boxes
                      size={35}
                      className="mx-auto text-slate-500"
                    />

                    <p className="mt-3 text-sm font-bold text-slate-800">
                      No coffee lots
                      found.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-300 px-4 py-4">
          <p className="text-sm font-medium text-slate-700">
            {total} lots · Page{" "}
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
      </section>

      {createOpen && (
        <Modal>
          <ModalCard
            title="Create Coffee Lot"
            close={() =>
              setCreateOpen(false)
            }
          >
            <Field label="Coffee Source">
              <select
                value={source}
                onChange={(event) =>
                  setSource(
                    event.target.value,
                  )
                }
                className={inputClass}
              >
                <option value="">
                  Select source
                </option>

                {sources.map(
                  (item) => (
                    <option
                      key={sourceKey(
                        item,
                      )}
                      value={sourceKey(
                        item,
                      )}
                    >
                      {item.reference} —{" "}
                      {item.label} —{" "}
                      {formatNumber(
                        item.weight_kg,
                      )}{" "}
                      Kg
                    </option>
                  ),
                )}
              </select>
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Bag Count">
                <input
                  type="number"
                  min="1"
                  value={bagCount}
                  onChange={(event) =>
                    setBagCount(
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Lot Date">
                <input
                  type="date"
                  value={lotDate}
                  onChange={(event) =>
                    setLotDate(
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </Field>
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
                placeholder="Warehouse A"
                className={inputClass}
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
                setCreateOpen(false)
              }
              submit={() =>
                void submitCreate()
              }
              text="Create Lot"
            />
          </ModalCard>
        </Modal>
      )}

      {editing && (
        <Modal>
          <ModalCard
            title={`Edit ${editing.lot_code}`}
            close={() =>
              setEditing(null)
            }
          >
            <div className="rounded-lg border border-slate-300 bg-slate-50 p-4 text-sm font-semibold">
              Current weight:{" "}
              {formatNumber(
                editing.current_weight_kg,
              )}{" "}
              Kg
            </div>

            <Field label="Bag Count">
              <input
                type="number"
                min="1"
                value={bagCount}
                onChange={(event) =>
                  setBagCount(
                    event.target.value,
                  )
                }
                className={inputClass}
              />
            </Field>

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
                className={inputClass}
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

      {viewing && (
        <Modal>
          <ModalCard
            title={
              viewing.lot_code
            }
            close={() =>
              setViewing(null)
            }
          >
            <div className="grid gap-x-5 md:grid-cols-3">
              <Detail
                title="Source"
                value={label(
                  viewing.source_type,
                )}
              />

              <Detail
                title="Coffee Type"
                value={label(
                  viewing.coffee_type,
                )}
              />

              <Detail
                title="Status"
                value={label(
                  viewing.status,
                )}
              />

              <Detail
                title="Initial Weight"
                value={`${formatNumber(
                  viewing.initial_weight_kg,
                )} Kg`}
              />

              <Detail
                title="Current Weight"
                value={`${formatNumber(
                  viewing.current_weight_kg,
                )} Kg`}
              />

              <Detail
                title="Bags"
                value={
                  viewing.bag_count
                    ? String(
                        viewing.bag_count,
                      )
                    : "—"
                }
              />

              <Detail
                title="Stage"
                value={label(
                  viewing.processing_stage,
                )}
              />

              <Detail
                title="Storage"
                value={
                  viewing.storage_location ??
                  "—"
                }
              />

              <Detail
                title="Lot Date"
                value={formatDate(
                  viewing.lot_date,
                )}
              />
            </div>
          </ModalCard>
        </Modal>
      )}
    </div>
  );
}

function Metric({
  title,
  value,
  green = false,
}: {
  title: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
      <p className="text-xs font-extrabold uppercase text-slate-700">
        {title}
      </p>

      <p
        className={`mt-2 text-2xl font-extrabold ${
          green
            ? "text-[#075b38]"
            : "text-slate-950"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Status({
  value,
}: {
  value: CoffeeLotStatus;
}) {
  return (
    <span
      className={`rounded-md px-2.5 py-1 text-xs font-extrabold capitalize ${
        value === "active"
          ? "bg-emerald-100 text-emerald-900"
          : "bg-slate-200 text-slate-800"
      }`}
    >
      {value}
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

function Detail({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="border-b border-slate-300 py-4">
      <p className="text-xs font-extrabold uppercase text-slate-700">
        {title}
      </p>

      <p className="mt-1 text-sm font-bold">
        {value}
      </p>
    </div>
  );
}

function SmallButton({
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
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
}) {
  return (
    <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-300 px-6 py-4">
        <h2 className="text-xl font-extrabold">
          {title}
        </h2>

        <button
          type="button"
          onClick={close}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-400"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-4 p-6">
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

function sourceKey(
  source: CoffeeLotSource,
) {
  return `${source.source_type}:${source.source_id}`;
}

function formatNumber(
  value: string | number,
) {
  const number =
    Number(value);

  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 2,
    },
  ).format(
    Number.isFinite(number)
      ? number
      : 0,
  );
}

function label(
  value: string,
) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatDate(
  value: string,
) {
  const date =
    new Date(value);

  return Number.isNaN(
    date.getTime(),
  )
    ? value
    : new Intl.DateTimeFormat(
        "en-GB",
        {
          dateStyle: "medium",
        },
      ).format(date);
}

function today() {
  const date =
    new Date();

  date.setMinutes(
    date.getMinutes() -
      date.getTimezoneOffset(),
  );

  return date
    .toISOString()
    .slice(0, 10);
}

function message(
  error: unknown,
) {
  return error instanceof Error
    ? error.message
    : "Something went wrong.";
}
