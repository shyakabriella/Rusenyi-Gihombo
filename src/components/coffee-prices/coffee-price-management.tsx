"use client";

import {
  BadgeDollarSign,
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Eye,
  FileDown,
  Filter,
  LoaderCircle,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  activateCoffeePrice,
  createCoffeePrice,
  deactivateCoffeePrice,
  getActiveCoffeePrices,
  getCoffeePrice,
  getCoffeePrices,
  updateCoffeePrice,
} from "@/services/coffee-price-service";

import {
  getCoffeeSeasons,
} from "@/services/coffee-season-service";

import type {
  CoffeePrice,
  CoffeePricePayload,
  CoffeePriceStatus,
  CoffeeType,
} from "@/types/coffee-price";

import type {
  CoffeeSeason,
} from "@/types/coffee-season";

type FormState = {
  coffee_season_id: string;
  coffee_type: CoffeeType;
  price_per_kg: string;
  effective_from: string;
  effective_to: string;
  notes: string;
};

type Confirmation = {
  action: "activate" | "deactivate";
  price: CoffeePrice;
} | null;

const emptyForm: FormState = {
  coffee_season_id: "",
  coffee_type: "cherry",
  price_per_kg: "",
  effective_from: "",
  effective_to: "",
  notes: "",
};

const coffeeTypes: {
  value: CoffeeType;
  label: string;
}[] = [
  {
    value: "cherry",
    label: "Coffee Cherry",
  },
  {
    value: "parchment",
    label: "Parchment Coffee",
  },
  {
    value: "green_coffee",
    label: "Green Coffee",
  },
];

export default function CoffeePriceManagement() {
  const [items, setItems] =
    useState<CoffeePrice[]>([]);

  const [seasons, setSeasons] =
    useState<CoffeeSeason[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [page, setPage] =
    useState(1);

  const [lastPage, setLastPage] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [search, setSearch] =
    useState("");

  const [seasonFilter, setSeasonFilter] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [appliedSearch, setAppliedSearch] =
    useState("");

  const [appliedSeason, setAppliedSeason] =
    useState("");

  const [appliedType, setAppliedType] =
    useState("");

  const [appliedStatus, setAppliedStatus] =
    useState("");

  const [activePrices, setActivePrices] =
    useState<CoffeePrice[]>([]);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [formModalOpen, setFormModalOpen] =
    useState(false);

  const [viewModalOpen, setViewModalOpen] =
    useState(false);

  const [editing, setEditing] =
    useState<CoffeePrice | null>(null);

  const [viewing, setViewing] =
    useState<CoffeePrice | null>(null);

  const [form, setForm] =
    useState<FormState>({
      ...emptyForm,
    });

  const [confirmation, setConfirmation] =
    useState<Confirmation>(null);

  const availableSeasons =
    useMemo(
      () =>
        seasons.filter(
          (season) =>
            season.status !== "closed",
        ),
      [seasons],
    );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        pricesResponse,
        seasonsResponse,
        activeResponse,
      ] = await Promise.all([
        getCoffeePrices({
          search:
            appliedSearch ||
            undefined,

          coffee_season_id:
            appliedSeason
              ? Number(appliedSeason)
              : undefined,

          coffee_type:
            appliedType
              ? (appliedType as CoffeeType)
              : undefined,

          status:
            appliedStatus
              ? (appliedStatus as CoffeePriceStatus)
              : undefined,

          page,
          per_page: 10,
        }),

        getCoffeeSeasons({
          per_page: 100,
        }),

        getActiveCoffeePrices(),
      ]);

      setItems(
        pricesResponse.items,
      );

      setTotal(
        pricesResponse.pagination.total,
      );

      setLastPage(
        Math.max(
          1,
          pricesResponse.pagination.last_page,
        ),
      );

      setSeasons(
        seasonsResponse.items,
      );

      setActivePrices(
        activeResponse.prices,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load coffee prices.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    appliedSearch,
    appliedSeason,
    appliedType,
    appliedStatus,
    page,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const metrics = useMemo(() => {
    const draft =
      items.filter(
        (item) =>
          item.status === "draft",
      ).length;

    const inactive =
      items.filter(
        (item) =>
          item.status === "inactive",
      ).length;

    const average =
      activePrices.length
        ? activePrices.reduce(
            (sum, item) =>
              sum +
              Number(
                item.price_per_kg,
              ),
            0,
          ) /
          activePrices.length
        : 0;

    return {
      active:
        activePrices.length,

      average,

      draft,

      inactive,
    };
  }, [
    items,
    activePrices,
  ]);

  function applyFilters() {
    setAppliedSearch(
      search.trim(),
    );

    setAppliedSeason(
      seasonFilter,
    );

    setAppliedType(
      typeFilter,
    );

    setAppliedStatus(
      statusFilter,
    );

    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setSeasonFilter("");
    setTypeFilter("");
    setStatusFilter("");

    setAppliedSearch("");
    setAppliedSeason("");
    setAppliedType("");
    setAppliedStatus("");

    setPage(1);
  }

  function openCreate() {
    setError("");
    setSuccess("");
    setEditing(null);

    const preferred =
      seasons.find(
        (season) =>
          season.status ===
          "active",
      ) ??
      availableSeasons[0] ??
      null;

    setForm({
      ...emptyForm,

      coffee_season_id:
        preferred
          ? String(
              preferred.id,
            )
          : "",

      effective_from:
        preferred?.start_date ??
        "",
    });

    setFormModalOpen(true);
  }

  function openEdit(
    price: CoffeePrice,
  ) {
    if (
      price.status !== "draft"
    ) {
      setError(
        "Only Draft prices can be edited.",
      );

      return;
    }

    setError("");
    setSuccess("");

    setEditing(price);

    setForm({
      coffee_season_id:
        String(
          price.coffee_season_id,
        ),

      coffee_type:
        price.coffee_type,

      price_per_kg:
        String(
          price.price_per_kg,
        ),

      effective_from:
        price.effective_from,

      effective_to:
        price.effective_to ??
        "",

      notes:
        price.notes ??
        "",
    });

    setFormModalOpen(true);
  }

  async function openView(
    price: CoffeePrice,
  ) {
    setViewing(price);
    setViewModalOpen(true);
    setDetailsLoading(true);

    try {
      const response =
        await getCoffeePrice(
          price.id,
        );

      setViewing(response);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load price details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  async function submit(
    event: FormEvent,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const seasonId =
      Number(
        form.coffee_season_id,
      );

    const amount =
      Number(
        form.price_per_kg,
      );

    if (
      !seasonId ||
      seasonId <= 0
    ) {
      setError(
        "Coffee season is required.",
      );

      return;
    }

    if (
      !amount ||
      amount <= 0
    ) {
      setError(
        "Price per KG must be greater than zero.",
      );

      return;
    }

    if (
      !form.effective_from
    ) {
      setError(
        "Effective From date is required.",
      );

      return;
    }

    const payload: CoffeePricePayload = {
      coffee_season_id:
        seasonId,

      coffee_type:
        form.coffee_type,

      price_per_kg:
        amount,

      effective_from:
        form.effective_from,

      effective_to:
        form.effective_to ||
        null,

      notes:
        form.notes.trim() ||
        null,
    };

    setSaving(true);

    try {
      if (editing) {
        await updateCoffeePrice(
          editing.id,
          payload,
        );

        setSuccess(
          "Coffee price updated successfully.",
        );
      } else {
        await createCoffeePrice(
          payload,
        );

        setSuccess(
          "Coffee price created successfully.",
        );
      }

      setFormModalOpen(false);
      setEditing(null);

      await load();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save coffee price.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function confirmAction() {
    if (!confirmation) {
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      if (
        confirmation.action ===
        "activate"
      ) {
        await activateCoffeePrice(
          confirmation.price.id,
        );

        setSuccess(
          "Coffee price activated successfully.",
        );
      } else {
        await deactivateCoffeePrice(
          confirmation.price.id,
        );

        setSuccess(
          "Coffee price deactivated successfully.",
        );
      }

      setConfirmation(null);

      await load();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update coffee price.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  function exportCsv() {
    if (!items.length) {
      return;
    }

    const rows = [
      [
        "Code",
        "Season",
        "Coffee Type",
        "Price per KG",
        "Currency",
        "Effective From",
        "Effective To",
        "Status",
      ],

      ...items.map(
        (item) => [
          item.code,

          item.season?.name ??
            "",

          item.coffee_type_label,

          String(
            item.price_per_kg,
          ),

          item.currency,

          item.effective_from,

          item.effective_to ??
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
      "coffee-prices.csv";

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
    <div className="space-y-4">
      {/* PAGE TITLE */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Coffee Price Management
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-600">
            Manage coffee buying prices by season and coffee type.
          </p>
        </div>

        <button
          type="button"
          onClick={
            openCreate
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#064b30]"
        >
          <Plus size={17} />
          Add Coffee Price
        </button>
      </div>

      {/* FILTER BAR */}
      <section className="rounded-xl border border-[#e5ded4] bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.15fr_1fr_1fr_1fr_auto_auto_auto] xl:items-end">
          <FilterField label="Search">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={
                  search
                }
                onChange={(
                  event,
                ) =>
                  setSearch(
                    event.target
                      .value,
                  )
                }
                placeholder="Price code or season..."
                className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm font-medium text-slate-900 outline-none focus:border-[#075b38]"
              />
            </div>
          </FilterField>

          <FilterField label="Coffee Season">
            <select
              value={
                seasonFilter
              }
              onChange={(
                event,
              ) =>
                setSeasonFilter(
                  event.target
                    .value,
                )
              }
              className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none"
            >
              <option value="">
                All Seasons
              </option>

              {seasons.map(
                (season) => (
                  <option
                    key={
                      season.id
                    }
                    value={
                      season.id
                    }
                  >
                    {
                      season.name
                    }
                  </option>
                ),
              )}
            </select>
          </FilterField>

          <FilterField label="Coffee Type">
            <select
              value={
                typeFilter
              }
              onChange={(
                event,
              ) =>
                setTypeFilter(
                  event.target
                    .value,
                )
              }
              className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none"
            >
              <option value="">
                All Types
              </option>

              {coffeeTypes.map(
                (type) => (
                  <option
                    key={
                      type.value
                    }
                    value={
                      type.value
                    }
                  >
                    {
                      type.label
                    }
                  </option>
                ),
              )}
            </select>
          </FilterField>

          <FilterField label="Price Status">
            <select
              value={
                statusFilter
              }
              onChange={(
                event,
              ) =>
                setStatusFilter(
                  event.target
                    .value,
                )
              }
              className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none"
            >
              <option value="">
                All Statuses
              </option>

              <option value="draft">
                Draft
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>
          </FilterField>

          <button
            type="button"
            onClick={
              applyFilters
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white hover:bg-[#064b30]"
          >
            <Filter size={16} />
            Filter
          </button>

          <button
            type="button"
            onClick={
              resetFilters
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 hover:bg-slate-50"
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
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white hover:bg-[#064b30]"
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

      {/* SUMMARY CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={
            CheckCircle2
          }
          label="Active Prices"
          value={
            String(
              metrics.active,
            )
          }
          note="Currently in use"
        />

        <MetricCard
          icon={
            Banknote
          }
          label="Average Active Price"
          value={`${formatMoney(
            metrics.average,
          )} RWF`}
          note="Average price per KG"
        />

        <MetricCard
          icon={
            CircleDollarSign
          }
          label="Draft Prices"
          value={
            String(
              metrics.draft,
            )
          }
          note="Waiting for activation"
        />

        <MetricCard
          icon={
            BadgeDollarSign
          }
          label="Inactive Prices"
          value={
            String(
              metrics.inactive,
            )
          }
          note="Historical records"
        />
      </div>

      {/* TABLE */}
      <section className="overflow-hidden rounded-xl border border-[#e5ded4] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px]">
            <thead>
              <tr className="border-b border-[#e9e2d9] bg-[#fcfbf9] text-left text-xs font-bold text-slate-800">
                <th className="w-14 px-4 py-4">
                  #
                </th>

                <th className="px-4 py-4">
                  Price Code
                </th>

                <th className="px-4 py-4">
                  Season
                </th>

                <th className="px-4 py-4">
                  Coffee Type
                </th>

                <th className="px-4 py-4">
                  Price / KG
                </th>

                <th className="px-4 py-4">
                  Effective From
                </th>

                <th className="px-4 py-4">
                  Effective To
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
                    className="py-20 text-center"
                  >
                    <LoaderCircle
                      size={28}
                      className="mx-auto animate-spin text-[#075b38]"
                    />
                  </td>
                </tr>
              ) : items.length ? (
                items.map(
                  (
                    price,
                    index,
                  ) => (
                    <tr
                      key={
                        price.id
                      }
                      className="border-b border-slate-100 text-sm transition hover:bg-[#fdfbf8]"
                    >
                      <td className="px-4 py-3.5 font-semibold text-slate-700">
                        {(page - 1) *
                          10 +
                          index +
                          1}
                      </td>

                      <td className="px-4 py-3.5 font-bold text-slate-950">
                        {
                          price.code
                        }
                      </td>

                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-900">
                          {price
                            .season
                            ?.name ??
                            "—"}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {price
                            .season
                            ?.code ??
                            ""}
                        </p>
                      </td>

                      <td className="px-4 py-3.5 font-medium text-slate-800">
                        {
                          price.coffee_type_label
                        }
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-950">
                          {formatMoney(
                            Number(
                              price.price_per_kg,
                            ),
                          )}
                        </span>

                        <span className="ml-1 text-xs font-semibold text-slate-500">
                          {
                            price.currency
                          }
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-700">
                        {formatDate(
                          price.effective_from,
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-slate-700">
                        {formatDate(
                          price.effective_to,
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <StatusBadge
                          status={
                            price.status
                          }
                        />
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex justify-center gap-2">
                          <ActionButton
                            title="View"
                            onClick={() =>
                              void openView(
                                price,
                              )
                            }
                          >
                            <Eye
                              size={
                                16
                              }
                            />
                          </ActionButton>

                          {price.status ===
                            "draft" && (
                            <>
                              <ActionButton
                                title="Edit"
                                onClick={() =>
                                  openEdit(
                                    price,
                                  )
                                }
                              >
                                <Pencil
                                  size={
                                    16
                                  }
                                />
                              </ActionButton>

                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmation(
                                    {
                                      action:
                                        "activate",

                                      price,
                                    },
                                  )
                                }
                                className="rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
                              >
                                Activate
                              </button>
                            </>
                          )}

                          {price.status ===
                            "active" && (
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmation(
                                  {
                                    action:
                                      "deactivate",

                                    price,
                                  },
                                )
                              }
                              className="rounded-md bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 transition hover:bg-amber-100"
                            >
                              Deactivate
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
                    className="py-16 text-center"
                  >
                    <BadgeDollarSign
                      size={34}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-bold text-slate-900">
                      No coffee prices found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Add a coffee price or change your filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col gap-3 border-t border-[#e9e2d9] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-600">
            Showing page{" "}
            <span className="font-bold text-slate-900">
              {page}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-900">
              {lastPage}
            </span>
            {" · "}
            {total} price records
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={
                page <= 1
              }
              onClick={() =>
                setPage(
                  page - 1,
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 disabled:opacity-40"
            >
              <ChevronLeft
                size={17}
              />
            </button>

            <span className="flex h-9 min-w-9 items-center justify-center rounded-md bg-[#f7e7cd] px-3 text-sm font-bold text-[#80570f]">
              {page}
            </span>

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
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 disabled:opacity-40"
            >
              <ChevronRight
                size={17}
              />
            </button>
          </div>
        </div>
      </section>

      {/* CREATE / EDIT MODAL */}
      {formModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  {editing
                    ? "Edit Coffee Price"
                    : "Add Coffee Price"}
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Price code is generated automatically.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setFormModalOpen(
                    false,
                  )
                }
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={submit}
              className="space-y-5 p-6"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <ModalField
                  label="Coffee Season"
                  required
                >
                  <select
                    required
                    value={
                      form.coffee_season_id
                    }
                    disabled={
                      Boolean(
                        editing,
                      )
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        {
                          ...form,

                          coffee_season_id:
                            event
                              .target
                              .value,
                        },
                      )
                    }
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-900 disabled:bg-slate-100"
                  >
                    <option value="">
                      Select Season
                    </option>

                    {availableSeasons.map(
                      (
                        season,
                      ) => (
                        <option
                          key={
                            season.id
                          }
                          value={
                            season.id
                          }
                        >
                          {
                            season.name
                          }
                        </option>
                      ),
                    )}
                  </select>
                </ModalField>

                <ModalField
                  label="Coffee Type"
                  required
                >
                  <select
                    required
                    value={
                      form.coffee_type
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        {
                          ...form,

                          coffee_type:
                            event
                              .target
                              .value as CoffeeType,
                        },
                      )
                    }
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-900"
                  >
                    {coffeeTypes.map(
                      (
                        type,
                      ) => (
                        <option
                          key={
                            type.value
                          }
                          value={
                            type.value
                          }
                        >
                          {
                            type.label
                          }
                        </option>
                      ),
                    )}
                  </select>
                </ModalField>

                <ModalField
                  label="Price per KG (RWF)"
                  required
                >
                  <input
                    type="number"
                    min="1"
                    required
                    value={
                      form.price_per_kg
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        {
                          ...form,

                          price_per_kg:
                            event
                              .target
                              .value,
                        },
                      )
                    }
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-900"
                  />
                </ModalField>

                <ModalField
                  label="Effective From"
                  required
                >
                  <input
                    type="date"
                    required
                    value={
                      form.effective_from
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        {
                          ...form,

                          effective_from:
                            event
                              .target
                              .value,
                        },
                      )
                    }
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-900"
                  />
                </ModalField>

                <ModalField label="Effective To">
                  <input
                    type="date"
                    value={
                      form.effective_to
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        {
                          ...form,

                          effective_to:
                            event
                              .target
                              .value,
                        },
                      )
                    }
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-900"
                  />
                </ModalField>
              </div>

              <ModalField label="Notes">
                <textarea
                  rows={4}
                  value={
                    form.notes
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm(
                      {
                        ...form,

                        notes:
                          event
                            .target
                            .value,
                      },
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm font-medium text-slate-900"
                />
              </ModalField>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() =>
                    setFormModalOpen(
                      false,
                    )
                  }
                  className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="inline-flex h-10 min-w-[130px] items-center justify-center rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white disabled:opacity-50"
                >
                  {saving ? (
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                  ) : editing ? (
                    "Save Changes"
                  ) : (
                    "Create Price"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewModalOpen && viewing && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-xl font-bold text-slate-950">
                Coffee Price Details
              </h2>

              <button
                type="button"
                onClick={() =>
                  setViewModalOpen(
                    false,
                  )
                }
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            {detailsLoading ? (
              <div className="py-20 text-center">
                <LoaderCircle
                  size={28}
                  className="mx-auto animate-spin text-[#075b38]"
                />
              </div>
            ) : (
              <div className="space-y-5 p-6">
                <div className="rounded-xl bg-[#faf6ef] p-5">
                  <p className="text-sm font-semibold text-slate-600">
                    {
                      viewing.coffee_type_label
                    }
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-950">
                    {formatMoney(
                      Number(
                        viewing.price_per_kg,
                      ),
                    )}{" "}
                    RWF
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-600">
                    per kilogram
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Detail
                    label="Price Code"
                    value={
                      viewing.code
                    }
                  />

                  <Detail
                    label="Status"
                    value={
                      viewing.status
                    }
                  />

                  <Detail
                    label="Season"
                    value={
                      viewing
                        .season
                        ?.name ??
                      "—"
                    }
                  />

                  <Detail
                    label="Effective From"
                    value={formatDate(
                      viewing.effective_from,
                    )}
                  />

                  <Detail
                    label="Effective To"
                    value={formatDate(
                      viewing.effective_to,
                    )}
                  />

                  <Detail
                    label="Created By"
                    value={
                      viewing
                        .creator
                        ?.name ??
                      "—"
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONFIRMATION */}
      {confirmation && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-950">
              {confirmation.action ===
              "activate"
                ? "Activate Coffee Price?"
                : "Deactivate Coffee Price?"}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {confirmation.price.code}
              {" · "}
              {formatMoney(
                Number(
                  confirmation.price.price_per_kg,
                ),
              )}{" "}
              RWF/KG
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setConfirmation(
                    null,
                  )
                }
                className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-bold"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  actionLoading
                }
                onClick={() =>
                  void confirmAction()
                }
                className="h-10 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white"
              >
                {actionLoading
                  ? "Saving..."
                  : confirmation.action ===
                      "activate"
                    ? "Activate"
                    : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold text-slate-800">
        {label}
      </label>

      {children}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: typeof BadgeDollarSign;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-[#e5ded4] bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f6e7d2] text-[#075b38]">
          <Icon size={22} />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-700">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-950">
            {value}
          </p>

          <p className="mt-2 text-xs font-medium text-emerald-700">
            {note}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: CoffeePriceStatus;
}) {
  const classes = {
    active:
      "bg-emerald-50 text-emerald-800",

    draft:
      "bg-blue-50 text-blue-700",

    inactive:
      "bg-amber-50 text-amber-800",
  };

  return (
    <span
      className={`rounded-md px-2.5 py-1 text-xs font-bold capitalize ${classes[status]}`}
    >
      {status}
    </span>
  );
}

function ActionButton({
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
      className="flex h-8 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:border-[#075b38] hover:text-[#075b38]"
    >
      {children}
    </button>
  );
}

function ModalField({
  label,
  children,
  required = false,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-800">
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

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold capitalize text-slate-900">
        {value}
      </p>
    </div>
  );
}

function formatMoney(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 2,
    },
  ).format(value || 0);
}

function formatDate(
  value?: string | null,
): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(
    new Date(
      `${value}T00:00:00`,
    ),
  );
}
