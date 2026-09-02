"use client";

import {
  CheckCircle2,
  CircleDot,
  Clock3,
  Eye,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Truck,
  X,
  XCircle,
} from "lucide-react";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  cancelCollectionTrip,
  completeCollectionTrip,
  createCollectionTrip,
  getCollectionTrip,
  getCollectionTripDashboardRole,
  getCollectionTripDrivers,
  getCollectionTrips,
  getCollectionTripSummary,
  getEligibleFieldWeighings,
  updateCollectionTrip,
} from "@/services/collection-trip-service";

import type {
  CollectionTrip,
  CollectionTripStatus,
  CollectionTripSummary,
  DashboardRole,
  DriverLookup,
  EligibleFieldWeighing,
} from "@/types/collection-trip";

const inputClass =
  "h-11 w-full rounded-lg border border-slate-400 bg-white px-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-600 focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

const textareaClass =
  "min-h-24 w-full rounded-lg border border-slate-400 bg-white px-3 py-2.5 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-600 focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

const emptySummary: CollectionTripSummary = {
  total_trips: 0,
  planned_trips: 0,
  in_transit_trips: 0,
  arrived_trips: 0,
  completed_trips: 0,
  cancelled_trips: 0,
  completed_weight_kg: "0.00",
};

export default function CollectionTripManagement() {
  const [items, setItems] =
    useState<CollectionTrip[]>([]);

  const [summary, setSummary] =
    useState<CollectionTripSummary>(
      emptySummary,
    );

  const [role, setRole] =
    useState<DashboardRole>("");

  const [weighings, setWeighings] =
    useState<
      EligibleFieldWeighing[]
    >([]);

  const [drivers, setDrivers] =
    useState<DriverLookup[]>([]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [filters, setFilters] =
    useState({
      search: "",
      status: "",
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

  const [viewing, setViewing] =
    useState<CollectionTrip | null>(
      null,
    );

  const [editing, setEditing] =
    useState<CollectionTrip | null>(
      null,
    );

  const [createOpen, setCreateOpen] =
    useState(false);

  const [
    cancelTarget,
    setCancelTarget,
  ] =
    useState<CollectionTrip | null>(
      null,
    );

  const [
    weighingId,
    setWeighingId,
  ] =
    useState("");

  const [driverId, setDriverId] =
    useState("");

  const [
    vehicleRegistration,
    setVehicleRegistration,
  ] = useState("");

  const [notes, setNotes] =
    useState("");

  const [
    cancellationReason,
    setCancellationReason,
  ] = useState("");

  const canManage =
    role === "admin";

  const load = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const [list, totals] =
          await Promise.all([
            getCollectionTrips({
              search:
                filters.search ||
                undefined,

              status:
                filters.status
                  ? (
                      filters.status as CollectionTripStatus
                    )
                  : undefined,

              page,
              per_page: 15,
            }),

            getCollectionTripSummary(),
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
          await getCollectionTripDashboardRole();

        setRole(currentRole);

        if (
          currentRole === "admin"
        ) {
          const [
            availableWeighings,
            availableDrivers,
          ] = await Promise.all([
            getEligibleFieldWeighings(),
            getCollectionTripDrivers(),
          ]);

          setWeighings(
            availableWeighings,
          );

          setDrivers(
            availableDrivers,
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

  const selectedWeighing =
    useMemo(() => {
      return weighings.find(
        (item) =>
          item.id ===
          Number(weighingId),
      ) ?? null;
    }, [
      weighingId,
      weighings,
    ]);

  async function refreshLookups() {
    if (!canManage) {
      return;
    }

    const [
      availableWeighings,
      availableDrivers,
    ] = await Promise.all([
      getEligibleFieldWeighings(),
      getCollectionTripDrivers(),
    ]);

    setWeighings(
      availableWeighings,
    );

    setDrivers(
      availableDrivers,
    );
  }

  function applyFilters() {
    setFilters({
      search:
        search.trim(),
      status,
    });

    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setStatus("");

    setFilters({
      search: "",
      status: "",
    });

    setPage(1);
  }

  async function openCreate() {
    setError("");
    setSuccess("");

    try {
      await refreshLookups();

      setWeighingId("");
      setDriverId("");
      setVehicleRegistration("");
      setNotes("");

      setCreateOpen(true);
    } catch (error) {
      setError(
        errorMessage(error),
      );
    }
  }

  async function submitCreate() {
    if (!weighingId) {
      setError(
        "Select a confirmed field weighing.",
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      await createCollectionTrip({
        field_weighing_id:
          Number(weighingId),

        driver_user_id:
          driverId
            ? Number(driverId)
            : undefined,

        vehicle_registration:
          vehicleRegistration
            .trim() ||
          undefined,

        notes:
          notes.trim() ||
          undefined,
      });

      setCreateOpen(false);

      setSuccess(
        "Collection trip created successfully.",
      );

      await Promise.all([
        load(),
        refreshLookups(),
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
    trip: CollectionTrip,
  ) {
    try {
      setViewing(
        await getCollectionTrip(
          trip.id,
        ),
      );
    } catch (error) {
      setError(
        errorMessage(error),
      );
    }
  }

  function openEdit(
    trip: CollectionTrip,
  ) {
    setEditing(trip);

    setDriverId(
      trip.driver_user_id
        ? String(
            trip.driver_user_id,
          )
        : "",
    );

    setVehicleRegistration(
      trip.vehicle_registration ??
        "",
    );

    setNotes(
      trip.notes ?? "",
    );
  }

  async function submitEdit() {
    if (!editing) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await updateCollectionTrip(
        editing.id,
        {
          driver_user_id:
            driverId
              ? Number(driverId)
              : undefined,

          vehicle_registration:
            vehicleRegistration
              .trim() ||
            undefined,

          notes:
            notes.trim() ||
            undefined,
        },
      );

      setEditing(null);

      setSuccess(
        "Collection trip updated successfully.",
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

  async function completeTrip(
    trip: CollectionTrip,
  ) {
    const confirmed =
      window.confirm(
        `Complete ${trip.trip_code}?`,
      );

    if (!confirmed) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await completeCollectionTrip(
        trip.id,
      );

      setSuccess(
        `${trip.trip_code} completed successfully.`,
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
      await cancelCollectionTrip(
        cancelTarget.id,
        cancellationReason.trim(),
      );

      setCancelTarget(null);
      setCancellationReason("");

      setSuccess(
        "Collection trip cancelled successfully.",
      );

      await Promise.all([
        load(),
        refreshLookups(),
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
            Collection Trips
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-700">
            Track coffee transport
            from confirmed field
            weighing to factory
            arrival.
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
            New Collection Trip
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Total Trips"
          value={String(
            summary.total_trips,
          )}
          icon={
            <Truck size={19} />
          }
        />

        <Metric
          title="Planned"
          value={String(
            summary.planned_trips,
          )}
          icon={
            <Clock3 size={19} />
          }
        />

        <Metric
          title="In Transit"
          value={String(
            summary.in_transit_trips,
          )}
          icon={
            <CircleDot
              size={19}
            />
          }
          green
        />

        <Metric
          title="Completed Weight"
          value={`${formatNumber(
            summary.completed_weight_kg,
          )} Kg`}
          icon={
            <CheckCircle2
              size={19}
            />
          }
          green
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <MiniMetric
          title="Arrived"
          value={
            summary.arrived_trips
          }
        />

        <MiniMetric
          title="Completed"
          value={
            summary.completed_trips
          }
        />

        <MiniMetric
          title="Cancelled"
          value={
            summary.cancelled_trips
          }
        />
      </div>

      <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_220px_auto_auto]">
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
              placeholder="Search trip, driver, vehicle..."
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

            <option value="planned">
              Planned
            </option>

            <option value="in_transit">
              In Transit
            </option>

            <option value="arrived">
              Arrived
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="cancelled">
              Cancelled
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
          <table className="w-full min-w-[1250px]">
            <thead className="bg-[#f6f1e8]">
              <tr className="border-b border-slate-300 text-left text-xs font-extrabold uppercase text-slate-800">
                <th className="px-4 py-4">
                  Trip
                </th>

                <th className="px-4 py-4">
                  Agent
                </th>

                <th className="px-4 py-4">
                  Collection
                </th>

                <th className="px-4 py-4">
                  Field Weight
                </th>

                <th className="px-4 py-4">
                  Driver
                </th>

                <th className="px-4 py-4">
                  Vehicle
                </th>

                <th className="px-4 py-4">
                  Departure
                </th>

                <th className="px-4 py-4">
                  Arrival
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
                  (trip) => (
                    <tr
                      key={trip.id}
                      className="border-b border-slate-200 text-sm hover:bg-[#fffdf8]"
                    >
                      <td className="px-4 py-4">
                        <p className="font-extrabold text-[#80570f]">
                          {
                            trip.trip_code
                          }
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-600">
                          {trip.field_weighing
                            ?.weighing_code ??
                            `FW #${trip.field_weighing_id}`}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-bold">
                          {agentName(
                            trip,
                          )}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-600">
                          {trip.collection_point
                            ?.name ??
                            "No collection point"}
                        </p>
                      </td>

                      <td className="px-4 py-4 font-semibold">
                        {trip.agent_collection
                          ?.collection_code ??
                          `#${trip.agent_collection_id}`}
                      </td>

                      <td className="px-4 py-4 font-extrabold">
                        {formatNumber(
                          trip.field_weight_kg,
                        )}{" "}
                        Kg
                      </td>

                      <td className="px-4 py-4 font-semibold">
                        {trip.driver
                          ?.name ??
                          "Not assigned"}
                      </td>

                      <td className="px-4 py-4 font-semibold">
                        {trip.vehicle_registration ??
                          "—"}
                      </td>

                      <td className="px-4 py-4">
                        {formatDateTime(
                          trip.departure_at,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {formatDateTime(
                          trip.arrived_at,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          status={
                            trip.status
                          }
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-2">
                          <IconButton
                            title="View"
                            onClick={() =>
                              void openView(
                                trip,
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
                            trip.status ===
                              "planned" && (
                              <>
                                <IconButton
                                  title="Edit"
                                  onClick={() =>
                                    openEdit(
                                      trip,
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
                                      trip,
                                    );

                                    setCancellationReason(
                                      "",
                                    );
                                  }}
                                  className="h-9 rounded-lg border border-red-300 bg-white px-3 text-xs font-bold text-red-800 hover:bg-red-50"
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                          {canManage &&
                            trip.status ===
                              "arrived" && (
                              <button
                                type="button"
                                disabled={
                                  busy
                                }
                                onClick={() =>
                                  void completeTrip(
                                    trip,
                                  )
                                }
                                className="h-9 rounded-lg bg-[#075b38] px-3 text-xs font-bold text-white hover:bg-[#064a2f] disabled:opacity-50"
                              >
                                Complete
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
                    <Truck
                      size={38}
                      className="mx-auto text-slate-400"
                    />

                    <p className="mt-3 font-bold text-slate-800">
                      No collection trips
                      found.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-300 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-700">
            {total} trips · Page{" "}
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
              className="h-9 rounded-lg border border-slate-400 px-4 text-sm font-bold disabled:opacity-40"
            >
              Previous
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
            title="New Collection Trip"
            subtitle="Create a transport trip from a confirmed field weighing."
            close={() =>
              setCreateOpen(
                false,
              )
            }
          >
            <Field label="Confirmed Field Weighing">
              <select
                value={
                  weighingId
                }
                onChange={(
                  event,
                ) =>
                  setWeighingId(
                    event.target
                      .value,
                  )
                }
                className={
                  inputClass
                }
              >
                <option value="">
                  Select field weighing
                </option>

                {weighings.map(
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
                        item.weighing_code
                      }{" "}
                      —{" "}
                      {item.agent_collection
                        ?.collection_code ??
                        "Collection"}{" "}
                      —{" "}
                      {formatNumber(
                        item.field_weight_kg,
                      )}{" "}
                      Kg
                    </option>
                  ),
                )}
              </select>
            </Field>

            {selectedWeighing && (
              <div className="grid gap-3 rounded-lg border border-[#d9c9ae] bg-[#fffaf2] p-4 sm:grid-cols-3">
                <Info
                  title="Agent"
                  value={
                    selectedWeighing
                      .agent?.user
                      ?.name ??
                    "—"
                  }
                />

                <Info
                  title="Collection"
                  value={
                    selectedWeighing
                      .agent_collection
                      ?.collection_code ??
                    "—"
                  }
                />

                <Info
                  title="Field Weight"
                  value={`${formatNumber(
                    selectedWeighing.field_weight_kg,
                  )} Kg`}
                />
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Driver">
                <select
                  value={
                    driverId
                  }
                  onChange={(
                    event,
                  ) =>
                    setDriverId(
                      event.target
                        .value,
                    )
                  }
                  className={
                    inputClass
                  }
                >
                  <option value="">
                    Assign later
                  </option>

                  {drivers.map(
                    (driver) => (
                      <option
                        key={
                          driver.id
                        }
                        value={
                          driver.id
                        }
                      >
                        {
                          driver.name
                        }
                        {driver.phone
                          ? ` · ${driver.phone}`
                          : ""}
                      </option>
                    ),
                  )}
                </select>
              </Field>

              <Field label="Vehicle Registration">
                <input
                  value={
                    vehicleRegistration
                  }
                  onChange={(
                    event,
                  ) =>
                    setVehicleRegistration(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Example: RAB 123 C"
                  className={
                    inputClass
                  }
                />
              </Field>
            </div>

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
                placeholder="Optional trip notes..."
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
              text="Create Trip"
            />
          </ModalCard>
        </Modal>
      )}

      {editing && (
        <Modal>
          <ModalCard
            title={`Edit ${editing.trip_code}`}
            subtitle="Only planned trips can be edited."
            close={() =>
              setEditing(null)
            }
          >
            <div className="rounded-lg border border-slate-300 bg-slate-50 p-4">
              <p className="text-xs font-extrabold uppercase text-slate-600">
                Field Weight
              </p>

              <p className="mt-1 text-lg font-extrabold">
                {formatNumber(
                  editing.field_weight_kg,
                )}{" "}
                Kg
              </p>

              <p className="mt-1 text-xs font-semibold text-slate-600">
                Field weighing and
                coffee weight cannot
                be changed from the
                trip.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Driver">
                <select
                  value={
                    driverId
                  }
                  onChange={(
                    event,
                  ) =>
                    setDriverId(
                      event.target
                        .value,
                    )
                  }
                  className={
                    inputClass
                  }
                >
                  <option value="">
                    Not assigned
                  </option>

                  {drivers.map(
                    (driver) => (
                      <option
                        key={
                          driver.id
                        }
                        value={
                          driver.id
                        }
                      >
                        {
                          driver.name
                        }
                      </option>
                    ),
                  )}
                </select>
              </Field>

              <Field label="Vehicle Registration">
                <input
                  value={
                    vehicleRegistration
                  }
                  onChange={(
                    event,
                  ) =>
                    setVehicleRegistration(
                      event.target
                        .value,
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
            title={`Cancel ${cancelTarget.trip_code}`}
            subtitle="The trip remains in the audit history. Its field weighing can be used for a corrected trip."
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
                className={
                  textareaClass
                }
                placeholder="Explain why this trip is being cancelled..."
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
                Keep Trip
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
                  : "Cancel Trip"}
              </button>
            </div>
          </ModalCard>
        </Modal>
      )}

      {viewing && (
        <Modal>
          <ModalCard
            title={
              viewing.trip_code
            }
            subtitle="Collection trip traceability and transport details."
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
                title="Field Weighing"
                value={
                  viewing.field_weighing
                    ?.weighing_code ??
                  `#${viewing.field_weighing_id}`
                }
              />

              <Detail
                title="Collection"
                value={
                  viewing.agent_collection
                    ?.collection_code ??
                  `#${viewing.agent_collection_id}`
                }
              />

              <Detail
                title="Agent"
                value={agentName(
                  viewing,
                )}
              />

              <Detail
                title="Collection Point"
                value={
                  viewing.collection_point
                    ?.name ??
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
                title="Driver"
                value={
                  viewing.driver
                    ?.name ??
                  "Not assigned"
                }
              />

              <Detail
                title="Vehicle"
                value={
                  viewing.vehicle_registration ??
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

              <Detail
                title="Departure"
                value={formatDateTime(
                  viewing.departure_at,
                )}
              />

              <Detail
                title="Arrival"
                value={formatDateTime(
                  viewing.arrived_at,
                )}
              />

              <Detail
                title="Completed"
                value={formatDateTime(
                  viewing.completed_at,
                )}
              />

              <Detail
                title="Started By"
                value={
                  viewing.starter
                    ?.name ?? "—"
                }
              />

              <Detail
                title="Arrival By"
                value={
                  viewing.arriver
                    ?.name ?? "—"
                }
              />

              <Detail
                title="Completed By"
                value={
                  viewing.completer
                    ?.name ?? "—"
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
  value: string;
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
            : "text-slate-950"
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

function StatusBadge({
  status,
}: {
  status: CollectionTripStatus;
}) {
  const styles: Record<
    CollectionTripStatus,
    string
  > = {
    planned:
      "bg-amber-100 text-amber-900",

    in_transit:
      "bg-blue-100 text-blue-900",

    arrived:
      "bg-violet-100 text-violet-900",

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
        className="h-10 rounded-lg border border-slate-400 px-4 text-sm font-bold hover:bg-slate-100"
      >
        Cancel
      </button>

      <button
        type="button"
        disabled={busy}
        onClick={submit}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white hover:bg-[#064a2f] disabled:opacity-50"
      >
        {busy && (
          <LoaderCircle
            size={15}
            className="animate-spin"
          />
        )}

        {text}
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
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-400 hover:bg-slate-100"
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
  trip: CollectionTrip,
) {
  return (
    trip.agent?.user?.name ??
    trip.agent?.agent_code ??
    `Agent #${trip.agent_id}`
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
