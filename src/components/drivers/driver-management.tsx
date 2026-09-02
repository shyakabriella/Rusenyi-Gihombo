"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  CirclePlus,
  RefreshCw,
  Search,
  Truck,
  UserRound,
  X,
} from "lucide-react";

import {
  createDriver,
  getDrivers,
  getDriverSummary,
  updateDriverStatus,
} from "@/services/driver-service";

import {
  createUser,
} from "@/services/user-service";

import type {
  Driver,
  DriverSummary,
  DriverStatus,
} from "@/types/driver";

const emptySummary: DriverSummary = {
  total_drivers: 0,
  active_drivers: 0,
  inactive_drivers: 0,
  suspended_drivers: 0,
  assigned_drivers: 0,
  unassigned_drivers: 0,
};

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  license_number: "",
  license_category: "",
  license_expiry_date: "",
  notes: "",
};

function vehicleName(
  driver: Driver,
) {
  const vehicle =
    driver.assigned_vehicle ??
    driver.assignedVehicle;

  return (
    vehicle?.registration_number ??
    vehicle?.vehicle_code ??
    "Not assigned"
  );
}

export default function DriverManagement() {
  const [drivers, setDrivers] =
    useState<Driver[]>([]);

  const [summary, setSummary] =
    useState<DriverSummary>(
      emptySummary,
    );

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [pagination, setPagination] =
    useState({
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 0,
      from: null as number | null,
      to: null as number | null,
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [form, setForm] =
    useState(emptyForm);

  const load = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const [
          result,
          totals,
        ] =
          await Promise.all([
            getDrivers({
              search:
                search ||
                undefined,
              status:
                status ||
                undefined,
              page,
              per_page: 20,
            }),
            getDriverSummary(),
          ]);

        setDrivers(
          result.items ?? [],
        );

        setPagination(
          result.pagination,
        );

        setSummary(totals);
      } catch (requestError) {
        setError(
          requestError
            instanceof Error
            ? requestError.message
            : "Unable to load Drivers.",
        );
      } finally {
        setLoading(false);
      }
    },
    [
      search,
      status,
      page,
    ],
  );

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(
    event: FormEvent,
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const created =
        await createUser({
          name:
            form.name.trim(),
          email:
            form.email.trim(),
          phone:
            form.phone.trim(),
          role: "driver",
        });

      await createDriver({
        user_id:
          created.user.id,

        license_number:
          form.license_number
            .trim() ||
          null,

        license_category:
          form.license_category
            .trim() ||
          null,

        license_expiry_date:
          form.license_expiry_date ||
          null,

        notes:
          form.notes.trim() ||
          null,
      });

      setMessage(
        created
          .credentials_email_sent
          ? "Driver created. Login credentials were sent to the Driver."
          : "Driver created successfully.",
      );

      setForm(emptyForm);
      setModalOpen(false);

      await load();
    } catch (requestError) {
      setError(
        requestError
          instanceof Error
          ? requestError.message
          : "Unable to create Driver.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(
    driver: Driver,
    nextStatus: DriverStatus,
  ) {
    setError("");

    try {
      await updateDriverStatus(
        driver.id,
        nextStatus,
      );

      await load();
    } catch (requestError) {
      setError(
        requestError
          instanceof Error
          ? requestError.message
          : "Unable to update Driver.",
      );
    }
  }

  return (
    <div className="space-y-5 p-5 lg:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">
            Drivers
          </h2>

          <p className="mt-1 text-sm font-medium text-slate-700">
            Manage Driver login
            accounts, licenses and
            transport availability.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setModalOpen(true)
          }
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#075b38] px-4 text-sm font-semibold text-white hover:bg-[#064c30]"
        >
          <CirclePlus size={18} />
          Add Driver
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [
            "Total Drivers",
            summary.total_drivers,
          ],
          [
            "Active",
            summary.active_drivers,
          ],
          [
            "Assigned",
            summary.assigned_drivers,
          ],
          [
            "Unassigned",
            summary.unassigned_drivers,
          ],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-xl border border-[#e6dfd5] bg-white p-4"
          >
            <p className="text-xs font-semibold text-slate-600">
              {label}
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-950">
              {value}
            </p>
          </div>
        ))}
      </div>

      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border border-[#e6dfd5] bg-white">
        <div className="grid gap-3 border-b border-[#eee4d6] p-4 sm:grid-cols-[1fr_220px_auto]">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => {
                setSearch(
                  event.target.value,
                );
                setPage(1);
              }}
              placeholder="Search Driver..."
              className="h-10 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm text-slate-900 outline-none"
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
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-800"
          >
            <option value="">
              All Statuses
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

          <button
            type="button"
            onClick={() =>
              void load()
            }
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-[#faf7f1] text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">
                  Driver
                </th>
                <th className="px-4 py-3">
                  Code
                </th>
                <th className="px-4 py-3">
                  License
                </th>
                <th className="px-4 py-3">
                  Vehicle
                </th>
                <th className="px-4 py-3">
                  Status
                </th>
                <th className="px-4 py-3">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    Loading Drivers...
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    No Drivers found.
                  </td>
                </tr>
              ) : (
                drivers.map(
                  (driver) => (
                    <tr key={driver.id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-950">
                          {driver.user
                            ?.name ??
                            "Driver"}
                        </p>

                        <p className="text-xs text-slate-600">
                          {driver.user
                            ?.email ??
                            "—"}
                        </p>
                      </td>

                      <td className="px-4 py-3 font-semibold text-[#8a5b18]">
                        {
                          driver.driver_code
                        }
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {driver.license_number ??
                          "—"}

                        {driver.license_category ? (
                          <span className="ml-1 text-xs text-slate-500">
                            (
                            {
                              driver.license_category
                            }
                            )
                          </span>
                        ) : null}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {vehicleName(
                          driver,
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-700">
                          {driver.status}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {driver.status ===
                        "active" ? (
                          <button
                            type="button"
                            onClick={() =>
                              void changeStatus(
                                driver,
                                "inactive",
                              )
                            }
                            className="text-xs font-semibold text-amber-700"
                          >
                            Set Inactive
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              void changeStatus(
                                driver,
                                "active",
                              )
                            }
                            className="text-xs font-semibold text-[#075b38]"
                          >
                            Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 p-4">
          <p className="text-xs text-slate-600">
            {pagination.total} Drivers
          </p>

          <div className="flex gap-2">
            <button
              disabled={
                page <= 1
              }
              onClick={() =>
                setPage((value) =>
                  Math.max(
                    1,
                    value - 1,
                  ),
                )
              }
              className="rounded-lg border px-3 py-2 text-xs disabled:opacity-40"
            >
              Previous
            </button>

            <button
              disabled={
                page >=
                pagination.last_page
              }
              onClick={() =>
                setPage(
                  (value) =>
                    value + 1,
                )
              }
              className="rounded-lg border px-3 py-2 text-xs disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4">
          <form
            onSubmit={submit}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Add Driver
                </h3>

                <p className="mt-1 text-xs text-slate-600">
                  A login account and
                  Driver profile will
                  be created together.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setModalOpen(
                    false,
                  )
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">
                Full Name
                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name:
                        e.target
                          .value,
                    })
                  }
                  className="mt-1 h-11 w-full rounded-lg border px-3 font-normal"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Email
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email:
                        e.target
                          .value,
                    })
                  }
                  className="mt-1 h-11 w-full rounded-lg border px-3 font-normal"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Phone
                <input
                  required
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone:
                        e.target
                          .value,
                    })
                  }
                  className="mt-1 h-11 w-full rounded-lg border px-3 font-normal"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                License Number
                <input
                  value={
                    form.license_number
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      license_number:
                        e.target
                          .value,
                    })
                  }
                  className="mt-1 h-11 w-full rounded-lg border px-3 font-normal"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                License Category
                <input
                  value={
                    form.license_category
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      license_category:
                        e.target
                          .value,
                    })
                  }
                  placeholder="e.g. B, C, D"
                  className="mt-1 h-11 w-full rounded-lg border px-3 font-normal"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                License Expiry
                <input
                  type="date"
                  value={
                    form.license_expiry_date
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      license_expiry_date:
                        e.target
                          .value,
                    })
                  }
                  className="mt-1 h-11 w-full rounded-lg border px-3 font-normal"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                Notes
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      notes:
                        e.target
                          .value,
                    })
                  }
                  rows={3}
                  className="mt-1 w-full rounded-lg border px-3 py-2 font-normal"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t p-5">
              <button
                type="button"
                onClick={() =>
                  setModalOpen(
                    false,
                  )
                }
                className="rounded-lg border px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                disabled={saving}
                className="rounded-lg bg-[#075b38] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving
                  ? "Creating..."
                  : "Create Driver"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
