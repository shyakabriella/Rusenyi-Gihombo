"use client";

import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
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
  useState,
} from "react";

import {
  activateCoffeeSeason,
  closeCoffeeSeason,
  createCoffeeSeason,
  getActiveCoffeeSeason,
  getCoffeeSeason,
  getCoffeeSeasons,
  reopenCoffeeSeason,
  updateCoffeeSeason,
} from "@/services/coffee-season-service";

import type {
  CoffeeSeason,
  CoffeeSeasonPayload,
  CoffeeSeasonStatus,
} from "@/types/coffee-season";

const emptyForm: CoffeeSeasonPayload = {
  name: "",
  start_date: "",
  end_date: "",
  description: "",
};

type ConfirmationAction =
  | "activate"
  | "close"
  | "reopen";

type ConfirmationState = {
  action: ConfirmationAction;
  season: CoffeeSeason;
} | null;

function formatDate(
  value?: string | null,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(
    `${value}T00:00:00`,
  );

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
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function formatDateTime(
  value?: string | null,
): string {
  if (!value) {
    return "—";
  }

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
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

export default function CoffeeSeasonManagement() {
  const [items, setItems] =
    useState<CoffeeSeason[]>([]);

  const [
    activeSeason,
    setActiveSeason,
  ] =
    useState<CoffeeSeason | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [
    detailsLoading,
    setDetailsLoading,
  ] = useState(false);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [year, setYear] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [lastPage, setLastPage] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [
    formModalOpen,
    setFormModalOpen,
  ] = useState(false);

  const [
    viewModalOpen,
    setViewModalOpen,
  ] = useState(false);

  const [
    editing,
    setEditing,
  ] =
    useState<CoffeeSeason | null>(
      null,
    );

  const [
    viewingSeason,
    setViewingSeason,
  ] =
    useState<CoffeeSeason | null>(
      null,
    );

  const [form, setForm] =
    useState<CoffeeSeasonPayload>(
      emptyForm,
    );

  const [
    confirmation,
    setConfirmation,
  ] =
    useState<ConfirmationState>(
      null,
    );

  const load =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const [
          response,
          currentSeason,
        ] = await Promise.all([
          getCoffeeSeasons({
            search:
              search.trim() ||
              undefined,

            status:
              status ||
              undefined,

            year:
              year
                ? Number(year)
                : undefined,

            page,
            per_page: 20,
          }),

          getActiveCoffeeSeason(),
        ]);

        setItems(
          response.items,
        );

        setLastPage(
          Math.max(
            1,
            response.pagination
              .last_page,
          ),
        );

        setTotal(
          response.pagination
            .total,
        );

        setActiveSeason(
          currentSeason,
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load coffee seasons.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      page,
      search,
      status,
      year,
    ]);

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          void load();
        },
        250,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [load]);

  function clearMessage() {
    setError("");
    setSuccess("");
  }

  function openCreate() {
    clearMessage();

    setEditing(null);

    setForm({
      ...emptyForm,
    });

    setFormModalOpen(true);
  }

  function openEdit(
    season: CoffeeSeason,
  ) {
    if (
      season.status === "closed"
    ) {
      setError(
        "Closed coffee seasons cannot be edited. Reopen the season first.",
      );

      return;
    }

    clearMessage();

    setEditing(season);

    setForm({
      name: season.name,

      start_date:
        season.start_date,

      end_date:
        season.end_date ?? "",

      description:
        season.description ?? "",
    });

    setFormModalOpen(true);
  }

  async function openView(
    season: CoffeeSeason,
  ) {
    clearMessage();

    setViewingSeason(season);
    setViewModalOpen(true);
    setDetailsLoading(true);

    try {
      const latest =
        await getCoffeeSeason(
          season.id,
        );

      setViewingSeason(latest);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load season details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  function closeFormModal() {
    if (saving) {
      return;
    }

    setFormModalOpen(false);
    setEditing(null);

    setForm({
      ...emptyForm,
    });
  }

  function closeViewModal() {
    if (detailsLoading) {
      return;
    }

    setViewModalOpen(false);
    setViewingSeason(null);
  }

  async function submit(
    event: FormEvent,
  ) {
    event.preventDefault();

    clearMessage();

    const payload: CoffeeSeasonPayload =
      {
        name: form.name.trim(),

        start_date:
          form.start_date,

        end_date:
          form.end_date?.trim() ||
          null,

        description:
          form.description?.trim() ||
          null,
      };

    if (!payload.name) {
      setError(
        "Coffee season name is required.",
      );
      return;
    }

    if (!payload.start_date) {
      setError(
        "Start date is required.",
      );
      return;
    }

    if (
      payload.end_date &&
      payload.end_date <
        payload.start_date
    ) {
      setError(
        "End date cannot be before the start date.",
      );
      return;
    }

    setSaving(true);

    try {
      if (editing) {
        await updateCoffeeSeason(
          editing.id,
          payload,
        );

        setSuccess(
          "Coffee season updated successfully.",
        );
      } else {
        await createCoffeeSeason(
          payload,
        );

        setSuccess(
          "Coffee season created successfully.",
        );
      }

      setFormModalOpen(false);
      setEditing(null);

      setForm({
        ...emptyForm,
      });

      await load();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save coffee season.",
      );
    } finally {
      setSaving(false);
    }
  }

  function requestAction(
    action: ConfirmationAction,
    season: CoffeeSeason,
  ) {
    clearMessage();

    setConfirmation({
      action,
      season,
    });
  }

  async function confirmAction() {
    if (!confirmation) {
      return;
    }

    const {
      action,
      season,
    } = confirmation;

    setActionLoading(true);
    clearMessage();

    try {
      if (
        action === "activate"
      ) {
        await activateCoffeeSeason(
          season.id,
        );

        setSuccess(
          `${season.name} is now the active coffee season.`,
        );
      }

      if (action === "close") {
        await closeCoffeeSeason(
          season.id,
        );

        setSuccess(
          `${season.name} was closed successfully.`,
        );
      }

      if (action === "reopen") {
        await reopenCoffeeSeason(
          season.id,
        );

        setSuccess(
          `${season.name} was reopened and is now active.`,
        );
      }

      setConfirmation(null);

      await load();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update coffee season.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  function resetFilters() {
    setSearch("");
    setStatus("");
    setYear("");
    setPage(1);
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#e5dccf] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays
                size={23}
                className="text-[#0a5038]"
              />

              <h2 className="text-xl font-bold text-slate-950">
                Coffee Season
                Management
              </h2>
            </div>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-700">
              Create and manage
              operational coffee
              seasons. The Season Code
              is generated automatically
              by the backend.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0a5038] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#073d2b]"
          >
            <Plus size={18} />
            Add Season
          </button>
        </div>
      </section>

      {activeSeason ? (
        <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
          <div className="border-b border-emerald-100 bg-emerald-50 px-5 py-3">
            <div className="flex items-center gap-2">
              <CheckCircle2
                size={19}
                className="text-emerald-700"
              />

              <p className="text-sm font-bold uppercase tracking-wide text-emerald-800">
                Current Active Season
              </p>
            </div>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-5">
            <ActiveValue
              label="Season"
              value={
                activeSeason.name
              }
            />

            <ActiveValue
              label="Season Code"
              value={
                activeSeason.code
              }
            />

            <ActiveValue
              label="Start Date"
              value={formatDate(
                activeSeason.start_date,
              )}
            />

            <ActiveValue
              label="End Date"
              value={formatDate(
                activeSeason.end_date,
              )}
            />

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Status
              </p>

              <div className="mt-2">
                <SeasonStatus
                  status="active"
                />
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-bold text-amber-950">
            No active coffee season
          </p>

          <p className="mt-1 text-sm font-medium text-amber-800">
            Create a season or activate
            an existing Draft season
            before operational modules
            start using season data.
          </p>
        </section>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {success}
        </div>
      )}

      <section className="rounded-2xl border border-[#e5dccf] bg-white shadow-sm">
        <div className="grid gap-3 border-b border-[#eee7dd] p-4 md:grid-cols-2 xl:grid-cols-[1fr_180px_170px_auto]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={search}
              onChange={(
                event,
              ) => {
                setSearch(
                  event.target
                    .value,
                );

                setPage(1);
              }}
              placeholder="Search by season name or code..."
              className="h-11 w-full rounded-xl border border-[#cfc4b5] bg-white pl-10 pr-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-500 focus:border-[#0a5038] focus:ring-2 focus:ring-[#0a5038]/10"
            />
          </div>

          <select
            value={status}
            onChange={(
              event,
            ) => {
              setStatus(
                event.target
                  .value,
              );

              setPage(1);
            }}
            className="h-11 rounded-xl border border-[#cfc4b5] bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#0a5038]"
          >
            <option value="">
              All statuses
            </option>

            <option value="draft">
              Draft
            </option>

            <option value="active">
              Active
            </option>

            <option value="closed">
              Closed
            </option>
          </select>

          <input
            type="number"
            min="2000"
            max="2200"
            value={year}
            onChange={(
              event,
            ) => {
              setYear(
                event.target
                  .value,
              );

              setPage(1);
            }}
            placeholder="Filter by year"
            className="h-11 rounded-xl border border-[#cfc4b5] bg-white px-3 text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-500 focus:border-[#0a5038]"
          />

          <button
            type="button"
            onClick={
              resetFilters
            }
            className="h-11 rounded-xl border border-[#cfc4b5] bg-white px-4 text-sm font-bold text-slate-800 transition hover:bg-[#faf6ef]"
          >
            Clear Filters
          </button>
        </div>

        <div className="flex items-center justify-between border-b border-[#eee7dd] px-4 py-3">
          <p className="text-sm font-bold text-slate-900">
            Seasons
          </p>

          <p className="text-sm font-semibold text-slate-700">
            {total} record
            {total === 1
              ? ""
              : "s"}
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <LoaderCircle
              size={30}
              className="animate-spin text-[#0a5038]"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-[#faf6ef]">
                <tr className="text-xs font-bold uppercase tracking-wide text-slate-700">
                  <th className="px-4 py-3">
                    Season
                  </th>

                  <th className="px-4 py-3">
                    Code
                  </th>

                  <th className="px-4 py-3">
                    Start
                  </th>

                  <th className="px-4 py-3">
                    End
                  </th>

                  <th className="px-4 py-3">
                    Status
                  </th>

                  <th className="px-4 py-3">
                    Created By
                  </th>

                  <th className="px-4 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map(
                  (season) => (
                    <tr
                      key={
                        season.id
                      }
                      className="border-t border-slate-100 transition hover:bg-[#fdfbf8]"
                    >
                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-950">
                          {
                            season.name
                          }
                        </p>

                        {season.description && (
                          <p className="mt-1 max-w-xs truncate text-xs font-medium text-slate-600">
                            {
                              season.description
                            }
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4 font-bold text-slate-800">
                        {
                          season.code
                        }
                      </td>

                      <td className="px-4 py-4 font-medium text-slate-800">
                        {formatDate(
                          season.start_date,
                        )}
                      </td>

                      <td className="px-4 py-4 font-medium text-slate-800">
                        {formatDate(
                          season.end_date,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <SeasonStatus
                          status={
                            season.status
                          }
                        />
                      </td>

                      <td className="px-4 py-4 font-medium text-slate-800">
                        {season.creator
                          ?.name ??
                          "—"}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void openView(
                                season,
                              )
                            }
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#d9cfc2] bg-white px-3 text-xs font-bold text-slate-800 hover:bg-[#faf6ef]"
                          >
                            <Eye
                              size={
                                15
                              }
                            />
                            View
                          </button>

                          {season.status !==
                            "closed" && (
                            <button
                              type="button"
                              onClick={() =>
                                openEdit(
                                  season,
                                )
                              }
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#d9cfc2] bg-white px-3 text-xs font-bold text-slate-800 hover:bg-[#faf6ef]"
                            >
                              <Pencil
                                size={
                                  15
                                }
                              />
                              Edit
                            </button>
                          )}

                          {season.status ===
                            "draft" && (
                            <button
                              type="button"
                              onClick={() =>
                                requestAction(
                                  "activate",
                                  season,
                                )
                              }
                              className="h-9 rounded-lg bg-[#0a5038] px-3 text-xs font-bold text-white hover:bg-[#073d2b]"
                            >
                              Activate
                            </button>
                          )}

                          {season.status ===
                            "active" && (
                            <button
                              type="button"
                              onClick={() =>
                                requestAction(
                                  "close",
                                  season,
                                )
                              }
                              className="h-9 rounded-lg bg-amber-100 px-3 text-xs font-bold text-amber-900 hover:bg-amber-200"
                            >
                              Close
                            </button>
                          )}

                          {season.status ===
                            "closed" && (
                            <button
                              type="button"
                              onClick={() =>
                                requestAction(
                                  "reopen",
                                  season,
                                )
                              }
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#d9cfc2] bg-white px-3 text-xs font-bold text-slate-900 hover:bg-[#faf6ef]"
                            >
                              <RotateCcw
                                size={
                                  14
                                }
                              />
                              Reopen
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ),
                )}

                {!items.length && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-16 text-center"
                    >
                      <CalendarDays
                        size={34}
                        className="mx-auto text-slate-400"
                      />

                      <p className="mt-3 font-bold text-slate-800">
                        No coffee
                        seasons found
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-600">
                        Add a season
                        or change your
                        filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-[#eee7dd] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-700">
            Page {page} of{" "}
            {lastPage}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={
                page <= 1 ||
                loading
              }
              onClick={() =>
                setPage(
                  (current) =>
                    Math.max(
                      1,
                      current - 1,
                    ),
                )
              }
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#d9cfc2] px-3 text-xs font-bold text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft
                size={15}
              />
              Previous
            </button>

            <button
              type="button"
              disabled={
                page >=
                  lastPage ||
                loading
              }
              onClick={() =>
                setPage(
                  (current) =>
                    current + 1,
                )
              }
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#d9cfc2] px-3 text-xs font-bold text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight
                size={15}
              />
            </button>
          </div>
        </div>
      </section>

      {formModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[#eee7dd] bg-white px-5 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  {editing
                    ? "Edit Coffee Season"
                    : "Add Coffee Season"}
                </h3>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  Season Code
                  is generated
                  automatically
                  by the system.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeFormModal
                }
                className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={submit}
              className="space-y-5 p-5"
            >
              <FormField
                label="Season Name"
                required
              >
                <input
                  required
                  value={
                    form.name
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,

                        name:
                          event
                            .target
                            .value,
                      }),
                    )
                  }
                  placeholder="Example: 2026 Main Coffee Season"
                  className="h-11 w-full rounded-xl border border-[#cfc4b5] bg-white px-3 text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-500 focus:border-[#0a5038] focus:ring-2 focus:ring-[#0a5038]/10"
                />
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Start Date"
                  required
                >
                  <input
                    required
                    type="date"
                    value={
                      form.start_date
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,

                          start_date:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    className="h-11 w-full rounded-xl border border-[#cfc4b5] bg-white px-3 text-sm font-semibold text-slate-950 outline-none focus:border-[#0a5038]"
                  />
                </FormField>

                <FormField label="End Date">
                  <input
                    type="date"
                    min={
                      form.start_date ||
                      undefined
                    }
                    value={
                      form.end_date ??
                      ""
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm(
                        (
                          current,
                        ) => ({
                          ...current,

                          end_date:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    className="h-11 w-full rounded-xl border border-[#cfc4b5] bg-white px-3 text-sm font-semibold text-slate-950 outline-none focus:border-[#0a5038]"
                  />
                </FormField>
              </div>

              <FormField label="Description">
                <textarea
                  rows={4}
                  value={
                    form.description ??
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm(
                      (
                        current,
                      ) => ({
                        ...current,

                        description:
                          event
                            .target
                            .value,
                      }),
                    )
                  }
                  placeholder="Optional notes about this coffee season..."
                  className="w-full resize-none rounded-xl border border-[#cfc4b5] bg-white px-3 py-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-500 focus:border-[#0a5038] focus:ring-2 focus:ring-[#0a5038]/10"
                />
              </FormField>

              {editing && (
                <div className="rounded-xl border border-[#e6ddd1] bg-[#faf6ef] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                    System-generated
                    Season Code
                  </p>

                  <p className="mt-1 text-base font-bold text-slate-950">
                    {
                      editing.code
                    }
                  </p>
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 border-t border-[#eee7dd] pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={
                    closeFormModal
                  }
                  className="h-10 rounded-lg border border-[#cfc4b5] px-4 text-sm font-bold text-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-10 min-w-[130px] items-center justify-center rounded-lg bg-[#0a5038] px-4 text-sm font-bold text-white hover:bg-[#073d2b] disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <LoaderCircle
                        size={16}
                        className="mr-2 animate-spin"
                      />
                      Saving...
                    </>
                  ) : editing ? (
                    "Save Changes"
                  ) : (
                    "Create Season"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#eee7dd] bg-white px-5 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Coffee Season
                  Details
                </h3>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  Complete season
                  information and
                  lifecycle.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeViewModal
                }
                className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            {detailsLoading ? (
              <div className="flex min-h-[320px] items-center justify-center">
                <LoaderCircle
                  size={28}
                  className="animate-spin text-[#0a5038]"
                />
              </div>
            ) : viewingSeason ? (
              <div className="space-y-5 p-5">
                <div className="flex flex-col gap-3 rounded-xl border border-[#e6ddd1] bg-[#faf6ef] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-bold text-slate-950">
                      {
                        viewingSeason.name
                      }
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-700">
                      {
                        viewingSeason.code
                      }
                    </p>
                  </div>

                  <SeasonStatus
                    status={
                      viewingSeason.status
                    }
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Detail
                    label="Start Date"
                    value={formatDate(
                      viewingSeason.start_date,
                    )}
                  />

                  <Detail
                    label="End Date"
                    value={formatDate(
                      viewingSeason.end_date,
                    )}
                  />

                  <Detail
                    label="Created By"
                    value={
                      viewingSeason
                        .creator
                        ?.name ??
                      "—"
                    }
                  />

                  <Detail
                    label="Activated By"
                    value={
                      viewingSeason
                        .activator
                        ?.name ??
                      "—"
                    }
                  />

                  <Detail
                    label="Activated At"
                    value={formatDateTime(
                      viewingSeason.activated_at,
                    )}
                  />

                  <Detail
                    label="Closed By"
                    value={
                      viewingSeason
                        .closer
                        ?.name ??
                      "—"
                    }
                  />

                  <Detail
                    label="Closed At"
                    value={formatDateTime(
                      viewingSeason.closed_at,
                    )}
                  />

                  <Detail
                    label="Status"
                    value={
                      viewingSeason.status
                    }
                    capitalize
                  />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                    Description
                  </p>

                  <div className="mt-2 rounded-xl border border-[#e6ddd1] bg-white p-4 text-sm font-medium leading-6 text-slate-800">
                    {viewingSeason.description ??
                      "No description provided."}
                  </div>
                </div>

                <div className="flex justify-end border-t border-[#eee7dd] pt-4">
                  <button
                    type="button"
                    onClick={
                      closeViewModal
                    }
                    className="h-10 rounded-lg bg-[#0a5038] px-5 text-sm font-bold text-white hover:bg-[#073d2b]"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {confirmation && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f4e7d2] text-[#0a5038]">
                <CalendarDays
                  size={21}
                />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-950">
                {
                  confirmationTitle(
                    confirmation.action,
                  )
                }
              </h3>

              <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
                {
                  confirmationMessage(
                    confirmation.action,
                    confirmation
                      .season,
                  )
                }
              </p>

              {confirmation.action ===
                "close" && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
                  New operational
                  transactions should
                  not use this season
                  after it is closed.
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={
                    actionLoading
                  }
                  onClick={() =>
                    setConfirmation(
                      null,
                    )
                  }
                  className="h-10 rounded-lg border border-[#cfc4b5] px-4 text-sm font-bold text-slate-800 disabled:opacity-50"
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
                  className="inline-flex h-10 min-w-[110px] items-center justify-center rounded-lg bg-[#0a5038] px-4 text-sm font-bold text-white disabled:opacity-60"
                >
                  {actionLoading ? (
                    <>
                      <LoaderCircle
                        size={16}
                        className="mr-2 animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    confirmationButton(
                      confirmation.action,
                    )
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActiveValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
        {label}
      </p>

      <p className="mt-2 text-sm font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function Detail({
  label,
  value,
  capitalize = false,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#e6ddd1] bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
        {label}
      </p>

      <p
        className={[
          "mt-2 text-sm font-bold text-slate-950",
          capitalize
            ? "capitalize"
            : "",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
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

function SeasonStatus({
  status,
}: {
  status: CoffeeSeasonStatus;
}) {
  const styles: Record<
    CoffeeSeasonStatus,
    string
  > = {
    draft:
      "border-slate-200 bg-slate-100 text-slate-800",

    active:
      "border-emerald-200 bg-emerald-50 text-emerald-800",

    closed:
      "border-amber-200 bg-amber-50 text-amber-900",
  };

  return (
    <span
      className={[
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-bold capitalize",
        styles[status],
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function confirmationTitle(
  action: ConfirmationAction,
): string {
  if (action === "activate") {
    return "Activate Coffee Season";
  }

  if (action === "close") {
    return "Close Coffee Season";
  }

  return "Reopen Coffee Season";
}

function confirmationButton(
  action: ConfirmationAction,
): string {
  if (action === "activate") {
    return "Activate";
  }

  if (action === "close") {
    return "Close Season";
  }

  return "Reopen";
}

function confirmationMessage(
  action: ConfirmationAction,
  season: CoffeeSeason,
): string {
  if (action === "activate") {
    return `Are you sure you want to activate "${season.name}" (${season.code})? Only one coffee season can be active at a time.`;
  }

  if (action === "close") {
    return `Are you sure you want to close "${season.name}" (${season.code})?`;
  }

  return `Are you sure you want to reopen "${season.name}" (${season.code})? It will become the active season.`;
}
