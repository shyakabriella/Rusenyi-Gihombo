"use client";

import {
  CarFront,
  Eye,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Truck,
  Unlink,
  UserRound,
  Wrench,
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
  assignVehicleDriver,
  createDriver,
  createVehicle,
  getDrivers,
  getDriverSummary,
  getDriverUsers,
  getTransportRole,
  getVehicles,
  getVehicleSummary,
  unassignVehicleDriver,
  updateDriver,
  updateDriverStatus,
  updateVehicle,
  updateVehicleStatus,
} from "@/services/transport-service";

import type {
  DashboardRole,
  Driver,
  DriverStatus,
  DriverSummary,
  TransportUser,
  Vehicle,
  VehicleStatus,
  VehicleSummary,
} from "@/types/transport";

const inputClass =
  "h-11 w-full rounded-lg border border-slate-400 bg-white px-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-600 focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

const textareaClass =
  "min-h-24 w-full rounded-lg border border-slate-400 bg-white px-3 py-2.5 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-600 focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

const emptyDriverSummary: DriverSummary = {
  total_drivers: 0,
  active_drivers: 0,
  inactive_drivers: 0,
  suspended_drivers: 0,
  assigned_drivers: 0,
  unassigned_drivers: 0,
};

const emptyVehicleSummary: VehicleSummary = {
  total_vehicles: 0,
  available_vehicles: 0,
  assigned_vehicles: 0,
  in_trip_vehicles: 0,
  maintenance_vehicles: 0,
  inactive_vehicles: 0,
  total_capacity_kg: "0.00",
};

type Tab = "drivers" | "vehicles";

export default function TransportManagement() {
  const [tab, setTab] =
    useState<Tab>("drivers");

  const [role, setRole] =
    useState<DashboardRole>("");

  const canManage =
    role === "admin";

  return (
    <div className="space-y-5 text-slate-950">
      <div>
        <h1 className="text-3xl font-extrabold">
          Drivers & Vehicles
        </h1>

        <p className="mt-1 text-sm font-medium text-slate-700">
          Manage drivers and vehicles
          used to transport coffee from
          collection areas to the factory.
        </p>
      </div>

      <RoleLoader
        onRole={setRole}
      />

      <div className="inline-flex rounded-xl border border-slate-300 bg-white p-1 shadow-sm">
        <TabButton
          active={tab === "drivers"}
          onClick={() =>
            setTab("drivers")
          }
          icon={
            <UserRound size={16} />
          }
        >
          Drivers
        </TabButton>

        <TabButton
          active={tab === "vehicles"}
          onClick={() =>
            setTab("vehicles")
          }
          icon={
            <Truck size={16} />
          }
        >
          Vehicles
        </TabButton>
      </div>

      {tab === "drivers" ? (
        <DriversPanel
          canManage={canManage}
        />
      ) : (
        <VehiclesPanel
          canManage={canManage}
        />
      )}
    </div>
  );
}

function RoleLoader({
  onRole,
}: {
  onRole: (
    role: DashboardRole,
  ) => void;
}) {
  useEffect(() => {
    void getTransportRole()
      .then(onRole)
      .catch(() => {
        onRole("");
      });
  }, [onRole]);

  return null;
}

function DriversPanel({
  canManage,
}: {
  canManage: boolean;
}) {
  const [items, setItems] =
    useState<Driver[]>([]);

  const [summary, setSummary] =
    useState<DriverSummary>(
      emptyDriverSummary,
    );

  const [users, setUsers] =
    useState<TransportUser[]>([]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
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

  const [createOpen, setCreateOpen] =
    useState(false);

  const [editing, setEditing] =
    useState<Driver | null>(null);

  const [viewing, setViewing] =
    useState<Driver | null>(null);

  const [userId, setUserId] =
    useState("");

  const [
    licenseNumber,
    setLicenseNumber,
  ] = useState("");

  const [
    licenseCategory,
    setLicenseCategory,
  ] = useState("");

  const [
    licenseExpiry,
    setLicenseExpiry,
  ] = useState("");

  const [notes, setNotes] =
    useState("");

  const load = useCallback(
    async () => {
      setLoading(true);

      try {
        const [list, totals] =
          await Promise.all([
            getDrivers({
              search:
                search.trim() ||
                undefined,

              status:
                status
                  ? (
                      status as DriverStatus
                    )
                  : undefined,

              page,
              per_page: 15,
            }),

            getDriverSummary(),
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
      page,
      search,
      status,
    ],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const availableUsers =
    useMemo(() => {
      const existing =
        new Set(
          items.map(
            (driver) =>
              driver.user_id,
          ),
        );

      return users.filter(
        (user) =>
          !existing.has(user.id),
      );
    }, [items, users]);

  async function openCreate() {
    setError("");
    setSuccess("");

    try {
      const driverUsers =
        await getDriverUsers();

      setUsers(driverUsers);

      setUserId("");
      setLicenseNumber("");
      setLicenseCategory("");
      setLicenseExpiry("");
      setNotes("");

      setCreateOpen(true);
    } catch (error) {
      setError(
        errorMessage(error),
      );
    }
  }

  async function submitCreate() {
    if (!userId) {
      setError(
        "Select a Driver user account.",
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      await createDriver({
        user_id: Number(userId),

        license_number:
          licenseNumber.trim() ||
          undefined,

        license_category:
          licenseCategory.trim() ||
          undefined,

        license_expiry_date:
          licenseExpiry ||
          undefined,

        notes:
          notes.trim() ||
          undefined,
      });

      setCreateOpen(false);

      setSuccess(
        "Driver profile created successfully.",
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

  function openEdit(
    driver: Driver,
  ) {
    setEditing(driver);

    setLicenseNumber(
      driver.license_number ??
        "",
    );

    setLicenseCategory(
      driver.license_category ??
        "",
    );

    setLicenseExpiry(
      driver.license_expiry_date ??
        "",
    );

    setNotes(
      driver.notes ?? "",
    );
  }

  async function submitEdit() {
    if (!editing) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await updateDriver(
        editing.id,
        {
          license_number:
            licenseNumber.trim()
            || null,

          license_category:
            licenseCategory.trim()
            || null,

          license_expiry_date:
            licenseExpiry || null,

          notes:
            notes.trim() ||
            null,
        },
      );

      setEditing(null);

      setSuccess(
        "Driver updated successfully.",
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

  async function changeStatus(
    driver: Driver,
    value: DriverStatus,
  ) {
    const confirmed =
      window.confirm(
        `Change ${driver.driver_code} to ${label(value)}?`,
      );

    if (!confirmed) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await updateDriverStatus(
        driver.id,
        value,
      );

      setSuccess(
        "Driver status updated successfully.",
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

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canManage && (
          <button
            type="button"
            onClick={() =>
              void openCreate()
            }
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white hover:bg-[#064a2f]"
          >
            <Plus size={17} />
            New Driver
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Total Drivers"
          value={
            summary.total_drivers
          }
          icon={
            <UserRound size={18} />
          }
        />

        <Metric
          title="Active Drivers"
          value={
            summary.active_drivers
          }
          green
        />

        <Metric
          title="Assigned"
          value={
            summary.assigned_drivers
          }
        />

        <Metric
          title="Unassigned"
          value={
            summary.unassigned_drivers
          }
        />
      </div>

      <Filters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        options={[
          ["active", "Active"],
          ["inactive", "Inactive"],
          [
            "suspended",
            "Suspended",
          ],
        ]}
        reset={() => {
          setSearch("");
          setStatus("");
          setPage(1);
        }}
      />

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
          <table className="w-full min-w-[1050px]">
            <thead className="bg-[#f6f1e8]">
              <tr className="text-left text-xs font-extrabold uppercase text-slate-700">
                <th className="px-4 py-4">
                  Driver
                </th>

                <th className="px-4 py-4">
                  Contact
                </th>

                <th className="px-4 py-4">
                  License
                </th>

                <th className="px-4 py-4">
                  Expiry
                </th>

                <th className="px-4 py-4">
                  Vehicle
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
                <LoadingRow
                  columns={7}
                />
              ) : items.length ? (
                items.map(
                  (driver) => (
                    <tr
                      key={driver.id}
                      className="border-t border-slate-200 text-sm hover:bg-[#fffdf8]"
                    >
                      <td className="px-4 py-4">
                        <p className="font-extrabold">
                          {driver.user
                            ?.name ??
                            "—"}
                        </p>

                        <p className="mt-1 text-xs font-bold text-[#80570f]">
                          {
                            driver.driver_code
                          }
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p>
                          {driver.user
                            ?.phone ??
                            "—"}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {driver.user
                            ?.email ??
                            "—"}
                        </p>
                      </td>

                      <td className="px-4 py-4 font-semibold">
                        {driver.license_number ??
                          "—"}

                        {driver.license_category && (
                          <p className="mt-1 text-xs text-slate-600">
                            Category{" "}
                            {
                              driver.license_category
                            }
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {formatDate(
                          driver.license_expiry_date,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {driver.assigned_vehicle ? (
                          <>
                            <p className="font-bold">
                              {
                                driver.assigned_vehicle
                                  .registration_number
                              }
                            </p>

                            <p className="text-xs text-slate-600">
                              {
                                driver.assigned_vehicle
                                  .vehicle_type
                              }
                            </p>
                          </>
                        ) : (
                          "Not assigned"
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          value={
                            driver.status
                          }
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-2">
                          <IconButton
                            title="View"
                            onClick={() =>
                              setViewing(
                                driver,
                              )
                            }
                          >
                            <Eye size={15} />
                          </IconButton>

                          {canManage && (
                            <IconButton
                              title="Edit"
                              onClick={() =>
                                openEdit(
                                  driver,
                                )
                              }
                            >
                              <Pencil
                                size={
                                  15
                                }
                              />
                            </IconButton>
                          )}

                          {canManage &&
                            !driver.assigned_vehicle && (
                              <select
                                value=""
                                disabled={busy}
                                onChange={(
                                  event,
                                ) => {
                                  const value =
                                    event.target
                                      .value as DriverStatus;

                                  if (
                                    value
                                  ) {
                                    void changeStatus(
                                      driver,
                                      value,
                                    );
                                  }
                                }}
                                className="h-9 rounded-lg border border-slate-400 bg-white px-2 text-xs font-bold"
                              >
                                <option value="">
                                  Status
                                </option>

                                <option value="active">
                                  Active
                                </option>

                                <option value="inactive">
                                  Inactive
                                </option>

                                <option value="suspended">
                                  Suspended
                                </option>
                              </select>
                            )}
                        </div>
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <EmptyRow
                  columns={7}
                  text="No drivers found."
                />
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          lastPage={lastPage}
          total={total}
          setPage={setPage}
          noun="drivers"
        />
      </section>

      {createOpen && (
        <Modal>
          <ModalCard
            title="Create Driver Profile"
            close={() =>
              setCreateOpen(false)
            }
          >
            <Field label="Driver User Account">
              <select
                value={userId}
                onChange={(event) =>
                  setUserId(
                    event.target.value,
                  )
                }
                className={inputClass}
              >
                <option value="">
                  Select Driver
                </option>

                {availableUsers.map(
                  (user) => (
                    <option
                      key={user.id}
                      value={user.id}
                    >
                      {user.name}
                      {user.phone
                        ? ` · ${user.phone}`
                        : ""}
                    </option>
                  ),
                )}
              </select>
            </Field>

            <DriverFields
              licenseNumber={
                licenseNumber
              }
              setLicenseNumber={
                setLicenseNumber
              }
              licenseCategory={
                licenseCategory
              }
              setLicenseCategory={
                setLicenseCategory
              }
              licenseExpiry={
                licenseExpiry
              }
              setLicenseExpiry={
                setLicenseExpiry
              }
              notes={notes}
              setNotes={setNotes}
            />

            <Actions
              busy={busy}
              cancel={() =>
                setCreateOpen(false)
              }
              submit={() =>
                void submitCreate()
              }
              text="Create Driver"
            />
          </ModalCard>
        </Modal>
      )}

      {editing && (
        <Modal>
          <ModalCard
            title={`Edit ${editing.driver_code}`}
            close={() =>
              setEditing(null)
            }
          >
            <DriverFields
              licenseNumber={
                licenseNumber
              }
              setLicenseNumber={
                setLicenseNumber
              }
              licenseCategory={
                licenseCategory
              }
              setLicenseCategory={
                setLicenseCategory
              }
              licenseExpiry={
                licenseExpiry
              }
              setLicenseExpiry={
                setLicenseExpiry
              }
              notes={notes}
              setNotes={setNotes}
            />

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
              viewing.driver_code
            }
            close={() =>
              setViewing(null)
            }
          >
            <div className="grid gap-x-5 md:grid-cols-2">
              <Detail
                title="Driver"
                value={
                  viewing.user?.name ??
                  "—"
                }
              />

              <Detail
                title="Phone"
                value={
                  viewing.user?.phone ??
                  "—"
                }
              />

              <Detail
                title="License"
                value={
                  viewing.license_number ??
                  "—"
                }
              />

              <Detail
                title="Category"
                value={
                  viewing.license_category ??
                  "—"
                }
              />

              <Detail
                title="Expiry"
                value={formatDate(
                  viewing.license_expiry_date,
                )}
              />

              <Detail
                title="Status"
                value={label(
                  viewing.status,
                )}
              />

              <Detail
                title="Assigned Vehicle"
                value={
                  viewing.assigned_vehicle
                    ?.registration_number ??
                  "Not assigned"
                }
              />
            </div>
          </ModalCard>
        </Modal>
      )}
    </div>
  );
}

function VehiclesPanel({
  canManage,
}: {
  canManage: boolean;
}) {
  const [items, setItems] =
    useState<Vehicle[]>([]);

  const [summary, setSummary] =
    useState<VehicleSummary>(
      emptyVehicleSummary,
    );

  const [drivers, setDrivers] =
    useState<Driver[]>([]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
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

  const [createOpen, setCreateOpen] =
    useState(false);

  const [editing, setEditing] =
    useState<Vehicle | null>(null);

  const [viewing, setViewing] =
    useState<Vehicle | null>(null);

  const [
    assignTarget,
    setAssignTarget,
  ] = useState<Vehicle | null>(
    null,
  );

  const [
    registrationNumber,
    setRegistrationNumber,
  ] = useState("");

  const [
    vehicleType,
    setVehicleType,
  ] = useState("");

  const [make, setMake] =
    useState("");

  const [model, setModel] =
    useState("");

  const [
    manufactureYear,
    setManufactureYear,
  ] = useState("");

  const [capacity, setCapacity] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [
    assignDriverId,
    setAssignDriverId,
  ] = useState("");

  const load = useCallback(
    async () => {
      setLoading(true);

      try {
        const [list, totals] =
          await Promise.all([
            getVehicles({
              search:
                search.trim() ||
                undefined,

              status:
                status
                  ? (
                      status as VehicleStatus
                    )
                  : undefined,

              page,
              per_page: 15,
            }),

            getVehicleSummary(),
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
      page,
      search,
      status,
    ],
  );

  useEffect(() => {
    void load();
  }, [load]);

  async function loadDrivers() {
    const list =
      await getDrivers({
        status: "active",
        per_page: 100,
      });

    setDrivers(
      list.items.filter(
        (driver) =>
          !driver.assigned_vehicle,
      ),
    );
  }

  function resetVehicleForm() {
    setRegistrationNumber("");
    setVehicleType("");
    setMake("");
    setModel("");
    setManufactureYear("");
    setCapacity("");
    setNotes("");
  }

  async function submitCreate() {
    if (
      !registrationNumber.trim() ||
      !vehicleType.trim()
    ) {
      setError(
        "Registration number and vehicle type are required.",
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      await createVehicle({
        registration_number:
          registrationNumber.trim(),

        vehicle_type:
          vehicleType.trim(),

        make:
          make.trim() ||
          undefined,

        model:
          model.trim() ||
          undefined,

        manufacture_year:
          manufactureYear
            ? Number(
                manufactureYear,
              )
            : undefined,

        capacity_kg:
          capacity
            ? Number(capacity)
            : undefined,

        notes:
          notes.trim() ||
          undefined,
      });

      setCreateOpen(false);

      setSuccess(
        "Vehicle created successfully.",
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

  function openEdit(
    vehicle: Vehicle,
  ) {
    setEditing(vehicle);

    setRegistrationNumber(
      vehicle.registration_number,
    );

    setVehicleType(
      vehicle.vehicle_type,
    );

    setMake(
      vehicle.make ?? "",
    );

    setModel(
      vehicle.model ?? "",
    );

    setManufactureYear(
      vehicle.manufacture_year
        ? String(
            vehicle.manufacture_year,
          )
        : "",
    );

    setCapacity(
      vehicle.capacity_kg ??
        "",
    );

    setNotes(
      vehicle.notes ?? "",
    );
  }

  async function submitEdit() {
    if (!editing) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await updateVehicle(
        editing.id,
        {
          registration_number:
            registrationNumber.trim(),

          vehicle_type:
            vehicleType.trim(),

          make:
            make.trim() ||
            null,

          model:
            model.trim() ||
            null,

          manufacture_year:
            manufactureYear
              ? Number(
                  manufactureYear,
                )
              : null,

          capacity_kg:
            capacity
              ? Number(
                  capacity,
                )
              : null,

          notes:
            notes.trim() ||
            null,
        },
      );

      setEditing(null);

      setSuccess(
        "Vehicle updated successfully.",
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

  async function openAssign(
    vehicle: Vehicle,
  ) {
    try {
      await loadDrivers();

      setAssignDriverId("");
      setAssignTarget(vehicle);
    } catch (error) {
      setError(
        errorMessage(error),
      );
    }
  }

  async function submitAssign() {
    if (
      !assignTarget ||
      !assignDriverId
    ) {
      setError(
        "Select a Driver.",
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      await assignVehicleDriver(
        assignTarget.id,
        Number(assignDriverId),
      );

      setAssignTarget(null);

      setSuccess(
        "Driver assigned successfully.",
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

  async function unassign(
    vehicle: Vehicle,
  ) {
    if (
      !window.confirm(
        `Unassign the Driver from ${vehicle.registration_number}?`,
      )
    ) {
      return;
    }

    setBusy(true);

    try {
      await unassignVehicleDriver(
        vehicle.id,
      );

      setSuccess(
        "Driver unassigned successfully.",
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

  async function changeStatus(
    vehicle: Vehicle,
    value:
      | "available"
      | "maintenance"
      | "inactive",
  ) {
    if (
      !window.confirm(
        `Change ${vehicle.registration_number} to ${label(value)}?`,
      )
    ) {
      return;
    }

    setBusy(true);

    try {
      await updateVehicleStatus(
        vehicle.id,
        value,
      );

      setSuccess(
        "Vehicle status updated successfully.",
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

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canManage && (
          <button
            type="button"
            onClick={() => {
              resetVehicleForm();
              setCreateOpen(true);
            }}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white hover:bg-[#064a2f]"
          >
            <Plus size={17} />
            New Vehicle
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Total Vehicles"
          value={
            summary.total_vehicles
          }
          icon={
            <Truck size={18} />
          }
        />

        <Metric
          title="Available"
          value={
            summary.available_vehicles
          }
          green
        />

        <Metric
          title="Assigned"
          value={
            summary.assigned_vehicles
          }
        />

        <Metric
          title="Total Capacity"
          value={`${formatNumber(
            summary.total_capacity_kg,
          )} Kg`}
        />
      </div>

      <Filters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        options={[
          [
            "available",
            "Available",
          ],
          [
            "assigned",
            "Assigned",
          ],
          [
            "in_trip",
            "In Trip",
          ],
          [
            "maintenance",
            "Maintenance",
          ],
          [
            "inactive",
            "Inactive",
          ],
        ]}
        reset={() => {
          setSearch("");
          setStatus("");
          setPage(1);
        }}
      />

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
              <tr className="text-left text-xs font-extrabold uppercase text-slate-700">
                <th className="px-4 py-4">
                  Vehicle
                </th>

                <th className="px-4 py-4">
                  Type
                </th>

                <th className="px-4 py-4">
                  Make / Model
                </th>

                <th className="px-4 py-4">
                  Capacity
                </th>

                <th className="px-4 py-4">
                  Driver
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
                <LoadingRow
                  columns={7}
                />
              ) : items.length ? (
                items.map(
                  (vehicle) => (
                    <tr
                      key={vehicle.id}
                      className="border-t border-slate-200 text-sm hover:bg-[#fffdf8]"
                    >
                      <td className="px-4 py-4">
                        <p className="font-extrabold">
                          {
                            vehicle.registration_number
                          }
                        </p>

                        <p className="mt-1 text-xs font-bold text-[#80570f]">
                          {
                            vehicle.vehicle_code
                          }
                        </p>
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {
                          vehicle.vehicle_type
                        }
                      </td>

                      <td className="px-4 py-4">
                        {[
                          vehicle.make,
                          vehicle.model,
                        ]
                          .filter(Boolean)
                          .join(" ") ||
                          "—"}

                        {vehicle.manufacture_year && (
                          <p className="mt-1 text-xs text-slate-600">
                            {
                              vehicle.manufacture_year
                            }
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4 font-semibold">
                        {vehicle.capacity_kg
                          ? `${formatNumber(
                              vehicle.capacity_kg,
                            )} Kg`
                          : "—"}
                      </td>

                      <td className="px-4 py-4">
                        {vehicle.assigned_driver
                          ?.user
                          ?.name ??
                          "Not assigned"}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          value={
                            vehicle.status
                          }
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-2">
                          <IconButton
                            title="View"
                            onClick={() =>
                              setViewing(
                                vehicle,
                              )
                            }
                          >
                            <Eye size={15} />
                          </IconButton>

                          {canManage &&
                            vehicle.status !==
                              "in_trip" && (
                              <IconButton
                                title="Edit"
                                onClick={() =>
                                  openEdit(
                                    vehicle,
                                  )
                                }
                              >
                                <Pencil
                                  size={
                                    15
                                  }
                                />
                              </IconButton>
                            )}

                          {canManage &&
                            vehicle.assigned_driver_id ? (
                              <IconButton
                                title="Unassign Driver"
                                onClick={() =>
                                  void unassign(
                                    vehicle,
                                  )
                                }
                              >
                                <Unlink
                                  size={
                                    15
                                  }
                                />
                              </IconButton>
                            ) : (
                              canManage &&
                              vehicle.status ===
                                "available" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    void openAssign(
                                      vehicle,
                                    )
                                  }
                                  className="h-9 rounded-lg border border-[#075b38] px-3 text-xs font-bold text-[#075b38]"
                                >
                                  Assign Driver
                                </button>
                              )
                            )}

                          {canManage &&
                            !vehicle.assigned_driver_id &&
                            vehicle.status !==
                              "in_trip" && (
                              <select
                                value=""
                                disabled={busy}
                                onChange={(
                                  event,
                                ) => {
                                  const value =
                                    event.target
                                      .value as
                                      | "available"
                                      | "maintenance"
                                      | "inactive";

                                  if (
                                    value
                                  ) {
                                    void changeStatus(
                                      vehicle,
                                      value,
                                    );
                                  }
                                }}
                                className="h-9 rounded-lg border border-slate-400 bg-white px-2 text-xs font-bold"
                              >
                                <option value="">
                                  Status
                                </option>

                                <option value="available">
                                  Available
                                </option>

                                <option value="maintenance">
                                  Maintenance
                                </option>

                                <option value="inactive">
                                  Inactive
                                </option>
                              </select>
                            )}
                        </div>
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <EmptyRow
                  columns={7}
                  text="No vehicles found."
                />
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          lastPage={lastPage}
          total={total}
          setPage={setPage}
          noun="vehicles"
        />
      </section>

      {createOpen && (
        <Modal>
          <ModalCard
            title="Create Vehicle"
            close={() =>
              setCreateOpen(false)
            }
          >
            <VehicleFields
              registrationNumber={
                registrationNumber
              }
              setRegistrationNumber={
                setRegistrationNumber
              }
              vehicleType={
                vehicleType
              }
              setVehicleType={
                setVehicleType
              }
              make={make}
              setMake={setMake}
              model={model}
              setModel={setModel}
              manufactureYear={
                manufactureYear
              }
              setManufactureYear={
                setManufactureYear
              }
              capacity={capacity}
              setCapacity={setCapacity}
              notes={notes}
              setNotes={setNotes}
            />

            <Actions
              busy={busy}
              cancel={() =>
                setCreateOpen(false)
              }
              submit={() =>
                void submitCreate()
              }
              text="Create Vehicle"
            />
          </ModalCard>
        </Modal>
      )}

      {editing && (
        <Modal>
          <ModalCard
            title={`Edit ${editing.vehicle_code}`}
            close={() =>
              setEditing(null)
            }
          >
            <VehicleFields
              registrationNumber={
                registrationNumber
              }
              setRegistrationNumber={
                setRegistrationNumber
              }
              vehicleType={
                vehicleType
              }
              setVehicleType={
                setVehicleType
              }
              make={make}
              setMake={setMake}
              model={model}
              setModel={setModel}
              manufactureYear={
                manufactureYear
              }
              setManufactureYear={
                setManufactureYear
              }
              capacity={capacity}
              setCapacity={setCapacity}
              notes={notes}
              setNotes={setNotes}
            />

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

      {assignTarget && (
        <Modal>
          <ModalCard
            title={`Assign Driver · ${assignTarget.registration_number}`}
            close={() =>
              setAssignTarget(null)
            }
          >
            <Field label="Driver">
              <select
                value={
                  assignDriverId
                }
                onChange={(event) =>
                  setAssignDriverId(
                    event.target.value,
                  )
                }
                className={inputClass}
              >
                <option value="">
                  Select Driver
                </option>

                {drivers.map(
                  (driver) => (
                    <option
                      key={driver.id}
                      value={driver.id}
                    >
                      {driver.user
                        ?.name ??
                        driver.driver_code}
                      {" · "}
                      {driver.driver_code}
                    </option>
                  ),
                )}
              </select>
            </Field>

            <Actions
              busy={busy}
              cancel={() =>
                setAssignTarget(null)
              }
              submit={() =>
                void submitAssign()
              }
              text="Assign Driver"
            />
          </ModalCard>
        </Modal>
      )}

      {viewing && (
        <Modal>
          <ModalCard
            title={
              viewing.registration_number
            }
            close={() =>
              setViewing(null)
            }
          >
            <div className="grid gap-x-5 md:grid-cols-2">
              <Detail
                title="Vehicle Code"
                value={
                  viewing.vehicle_code
                }
              />

              <Detail
                title="Type"
                value={
                  viewing.vehicle_type
                }
              />

              <Detail
                title="Make"
                value={
                  viewing.make ??
                  "—"
                }
              />

              <Detail
                title="Model"
                value={
                  viewing.model ??
                  "—"
                }
              />

              <Detail
                title="Year"
                value={
                  viewing.manufacture_year
                    ? String(
                        viewing.manufacture_year,
                      )
                    : "—"
                }
              />

              <Detail
                title="Capacity"
                value={
                  viewing.capacity_kg
                    ? `${formatNumber(
                        viewing.capacity_kg,
                      )} Kg`
                    : "—"
                }
              />

              <Detail
                title="Driver"
                value={
                  viewing.assigned_driver
                    ?.user?.name ??
                  "Not assigned"
                }
              />

              <Detail
                title="Status"
                value={label(
                  viewing.status,
                )}
              />
            </div>
          </ModalCard>
        </Modal>
      )}
    </div>
  );
}

function DriverFields({
  licenseNumber,
  setLicenseNumber,
  licenseCategory,
  setLicenseCategory,
  licenseExpiry,
  setLicenseExpiry,
  notes,
  setNotes,
}: {
  licenseNumber: string;
  setLicenseNumber: (
    value: string,
  ) => void;
  licenseCategory: string;
  setLicenseCategory: (
    value: string,
  ) => void;
  licenseExpiry: string;
  setLicenseExpiry: (
    value: string,
  ) => void;
  notes: string;
  setNotes: (
    value: string,
  ) => void;
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="License Number">
          <input
            value={licenseNumber}
            onChange={(event) =>
              setLicenseNumber(
                event.target.value,
              )
            }
            className={inputClass}
          />
        </Field>

        <Field label="License Category">
          <input
            value={licenseCategory}
            onChange={(event) =>
              setLicenseCategory(
                event.target.value,
              )
            }
            placeholder="Example: B"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="License Expiry Date">
        <input
          type="date"
          value={licenseExpiry}
          onChange={(event) =>
            setLicenseExpiry(
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
          className={textareaClass}
        />
      </Field>
    </>
  );
}

function VehicleFields({
  registrationNumber,
  setRegistrationNumber,
  vehicleType,
  setVehicleType,
  make,
  setMake,
  model,
  setModel,
  manufactureYear,
  setManufactureYear,
  capacity,
  setCapacity,
  notes,
  setNotes,
}: {
  registrationNumber: string;
  setRegistrationNumber: (
    value: string,
  ) => void;
  vehicleType: string;
  setVehicleType: (
    value: string,
  ) => void;
  make: string;
  setMake: (
    value: string,
  ) => void;
  model: string;
  setModel: (
    value: string,
  ) => void;
  manufactureYear: string;
  setManufactureYear: (
    value: string,
  ) => void;
  capacity: string;
  setCapacity: (
    value: string,
  ) => void;
  notes: string;
  setNotes: (
    value: string,
  ) => void;
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Registration Number">
          <input
            value={
              registrationNumber
            }
            onChange={(event) =>
              setRegistrationNumber(
                event.target.value,
              )
            }
            placeholder="RAB 123 C"
            className={inputClass}
          />
        </Field>

        <Field label="Vehicle Type">
          <input
            value={vehicleType}
            onChange={(event) =>
              setVehicleType(
                event.target.value,
              )
            }
            placeholder="Truck, Pickup..."
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Make">
          <input
            value={make}
            onChange={(event) =>
              setMake(
                event.target.value,
              )
            }
            className={inputClass}
          />
        </Field>

        <Field label="Model">
          <input
            value={model}
            onChange={(event) =>
              setModel(
                event.target.value,
              )
            }
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Manufacture Year">
          <input
            type="number"
            value={
              manufactureYear
            }
            onChange={(event) =>
              setManufactureYear(
                event.target.value,
              )
            }
            className={inputClass}
          />
        </Field>

        <Field label="Capacity (Kg)">
          <input
            type="number"
            min="1"
            step="0.01"
            value={capacity}
            onChange={(event) =>
              setCapacity(
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
    </>
  );
}

function Filters({
  search,
  setSearch,
  status,
  setStatus,
  options,
  reset,
}: {
  search: string;
  setSearch: (
    value: string,
  ) => void;
  status: string;
  setStatus: (
    value: string,
  ) => void;
  options: Array<
    [string, string]
  >;
  reset: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
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
            placeholder="Search..."
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

          {options.map(
            ([value, title]) => (
              <option
                key={value}
                value={value}
              >
                {title}
              </option>
            ),
          )}
        </select>

        <button
          type="button"
          onClick={reset}
          className="h-11 rounded-lg border border-slate-400 bg-white px-5 text-sm font-bold hover:bg-slate-100"
        >
          Reset
        </button>
      </div>
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
  icon?: ReactNode;
  green?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-extrabold uppercase text-slate-600">
          {title}
        </p>

        {icon}
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

function StatusBadge({
  value,
}: {
  value: string;
}) {
  return (
    <span className="rounded-md bg-[#f6f1e8] px-2.5 py-1 text-xs font-extrabold text-[#684717]">
      {label(value)}
    </span>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold ${
        active
          ? "bg-[#075b38] text-white"
          : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      {icon}
      {children}
    </button>
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
      <p className="text-xs font-extrabold uppercase text-slate-600">
        {title}
      </p>

      <p className="mt-1 text-sm font-bold">
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

function LoadingRow({
  columns,
}: {
  columns: number;
}) {
  return (
    <tr>
      <td
        colSpan={columns}
        className="py-20"
      >
        <LoaderCircle
          size={30}
          className="mx-auto animate-spin text-[#075b38]"
        />
      </td>
    </tr>
  );
}

function EmptyRow({
  columns,
  text,
}: {
  columns: number;
  text: string;
}) {
  return (
    <tr>
      <td
        colSpan={columns}
        className="py-16 text-center font-bold text-slate-700"
      >
        {text}
      </td>
    </tr>
  );
}

function Pagination({
  page,
  lastPage,
  total,
  setPage,
  noun,
}: {
  page: number;
  lastPage: number;
  total: number;
  setPage: (
    value: number,
  ) => void;
  noun: string;
}) {
  return (
    <div className="flex items-center justify-between border-t border-slate-300 px-4 py-4">
      <p className="text-sm text-slate-700">
        {total} {noun} · Page{" "}
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
        onClick={cancel}
        disabled={busy}
        className="h-10 rounded-lg border border-slate-400 px-4 text-sm font-bold"
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={submit}
        disabled={busy}
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

function formatDate(
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
