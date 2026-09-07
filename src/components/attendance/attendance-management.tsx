"use client";

import {
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LockKeyhole,
  RefreshCw,
  Search,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  type AttendanceStatus,
  type AttendanceWorker,
  getWorkerAttendance,
} from "@/services/worker-attendance-service";

function dateKey(
  date: Date,
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(
      2,
      "0",
    );

  const day =
    String(
      date.getDate(),
    ).padStart(
      2,
      "0",
    );

  return `${year}-${month}-${day}`;
}

function todayKey() {
  return dateKey(
    new Date(),
  );
}

function moveDate(
  value: string,
  amount: number,
) {
  const [
    year,
    month,
    day,
  ] =
    value
      .split("-")
      .map(Number);

  const date =
    new Date(
      year,
      month - 1,
      day,
    );

  date.setDate(
    date.getDate() +
      amount,
  );

  return dateKey(
    date,
  );
}

function formatDate(
  value: string,
) {
  const [
    year,
    month,
    day,
  ] =
    value
      .split("-")
      .map(Number);

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      weekday:
        "long",
      day:
        "2-digit",
      month:
        "long",
      year:
        "numeric",
    },
  ).format(
    new Date(
      year,
      month - 1,
      day,
    ),
  );
}

export default function AttendanceManagement() {
  const [
    selectedDate,
    setSelectedDate,
  ] =
    useState(
      todayKey(),
    );

  const [
    workers,
    setWorkers,
  ] =
    useState<
      AttendanceWorker[]
    >([]);

  const [
    locked,
    setLocked,
  ] =
    useState(false);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    search,
    setSearch,
  ] =
    useState("");

  const load =
    useCallback(
      async () => {
        setLoading(
          true,
        );

        setError("");

        try {
          const result =
            await getWorkerAttendance(
              selectedDate,
            );

          setWorkers(
            result.workers ??
              [],
          );

          setLocked(
            Boolean(
              result.locked,
            ),
          );
        } catch (
          requestError
        ) {
          setWorkers(
            [],
          );

          setLocked(
            false,
          );

          setError(
            requestError
              instanceof Error
              ? requestError.message
              : "Unable to load attendance.",
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [
        selectedDate,
      ],
    );

  useEffect(() => {
    void load();
  }, [load]);

  const summary =
    useMemo(
      () => {
        const present =
          workers.filter(
            (worker) =>
              worker.status ===
              "present",
          ).length;

        const absent =
          workers.filter(
            (worker) =>
              worker.status ===
              "absent",
          ).length;

        const recorded =
          workers.filter(
            (worker) =>
              Boolean(
                worker.status,
              ),
          ).length;

        return {
          workers:
            workers.length,
          present,
          absent,
          recorded,
        };
      },
      [
        workers,
      ],
    );

  const filteredWorkers =
    useMemo(
      () => {
        const term =
          search
            .trim()
            .toLowerCase();

        if (!term) {
          return workers;
        }

        return workers.filter(
          (worker) =>
            [
              worker.name,
              worker.worker_code,
              worker.phone ??
                "",
              worker.email ??
                "",
              worker.national_id ??
                "",
            ]
              .join(" ")
              .toLowerCase()
              .includes(
                term,
              ),
        );
      },
      [
        workers,
        search,
      ],
    );

  const isToday =
    selectedDate ===
    todayKey();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950">
            Worker Attendance
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-600">
            Review daily attendance recorded by the Store Officer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              void load()
            }
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
          >
            <RefreshCw
              size={16}
            />
            Refresh
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-[#e5ded4] bg-[#fffaf2] p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e9f3ee] text-[#075b38]">
              <CalendarCheck2
                size={21}
              />
            </div>

            <div>
              <p className="text-xs font-bold uppercase text-slate-500">
                Attendance Date
              </p>

              <p className="mt-1 text-sm font-extrabold text-slate-950">
                {formatDate(
                  selectedDate,
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setSelectedDate(
                  moveDate(
                    selectedDate,
                    -1,
                  ),
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
            >
              <ChevronLeft
                size={18}
              />
            </button>

            <input
              type="date"
              max={todayKey()}
              value={
                selectedDate
              }
              onChange={(
                event,
              ) =>
                setSelectedDate(
                  event
                    .target
                    .value,
                )
              }
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#b88a45]"
            />

            <button
              type="button"
              disabled={
                isToday
              }
              onClick={() =>
                setSelectedDate(
                  moveDate(
                    selectedDate,
                    1,
                  ),
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight
                size={18}
              />
            </button>

            {!isToday && (
              <button
                type="button"
                onClick={() =>
                  setSelectedDate(
                    todayKey(),
                  )
                }
                className="h-10 rounded-lg bg-[#075b38] px-4 text-sm font-bold text-white hover:bg-[#064a2f]"
              >
                Today
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Workers"
          value={
            summary.workers
          }
          icon={
            <Users
              size={19}
            />
          }
        />

        <Metric
          label="Present"
          value={
            summary.present
          }
          icon={
            <UserCheck
              size={19}
            />
          }
          type="present"
        />

        <Metric
          label="Absent"
          value={
            summary.absent
          }
          icon={
            <UserX
              size={19}
            />
          }
          type="absent"
        />

        <Metric
          label="Recorded"
          value={`${summary.recorded}/${summary.workers}`}
          icon={
            <CalendarCheck2
              size={19}
            />
          }
        />
      </div>

      {locked ? (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <LockKeyhole
            size={18}
            className="mt-0.5 shrink-0 text-emerald-700"
          />

          <div>
            <p className="text-sm font-bold text-emerald-900">
              Attendance saved
            </p>

            <p className="mt-1 text-xs font-medium text-emerald-700">
              Attendance for this date was recorded and is locked from the daily attendance screen.
            </p>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-extrabold text-slate-950">
              Attendance Register
            </h2>

            <p className="mt-1 text-xs font-medium text-slate-500">
              {filteredWorkers.length} worker
              {filteredWorkers.length === 1
                ? ""
                : "s"}
            </p>
          </div>

          <div className="relative w-full sm:max-w-sm">
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
                  event
                    .target
                    .value,
                )
              }
              placeholder="Search worker..."
              className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-500 focus:border-[#b88a45]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left">
            <thead className="bg-[#f6f1e8]">
              <tr className="border-b border-slate-200 text-xs font-extrabold uppercase text-slate-600">
                <th className="px-4 py-4">
                  Worker
                </th>

                <th className="px-4 py-4">
                  Phone
                </th>

                <th className="px-4 py-4">
                  Status
                </th>

                <th className="px-4 py-4">
                  Attendance
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-16 text-center text-sm font-medium text-slate-500"
                  >
                    Loading attendance...
                  </td>
                </tr>
              ) : filteredWorkers.length ? (
                filteredWorkers.map(
                  (
                    worker,
                  ) => (
                    <tr
                      key={
                        worker.worker_id
                      }
                      className="border-b border-slate-100 text-sm hover:bg-[#fffdf8]"
                    >
                      <td className="px-4 py-4">
                        <p className="font-extrabold text-slate-950">
                          {
                            worker.name
                          }
                        </p>

                        <p className="mt-1 text-xs font-semibold text-[#80570f]">
                          {
                            worker.worker_code
                          }
                        </p>
                      </td>

                      <td className="px-4 py-4 font-medium text-slate-700">
                        {worker.phone ??
                          "—"}
                      </td>

                      <td className="px-4 py-4">
                        <AttendanceBadge
                          status={
                            worker.status
                          }
                        />
                      </td>

                      <td className="px-4 py-4">
                        {worker.attendance_id ? (
                          <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700">
                            <CalendarCheck2
                              size={15}
                            />
                            Recorded
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-500">
                            <Clock3
                              size={15}
                            />
                            Not recorded
                          </span>
                        )}
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-16 text-center"
                  >
                    <Users
                      size={38}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-bold text-slate-700">
                      No workers found
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      No attendance records or active workers are available for this date.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function AttendanceBadge({
  status,
}: {
  status?:
    | AttendanceStatus
    | null;
}) {
  if (!status) {
    return (
      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
        Not Recorded
      </span>
    );
  }

  const styles: Record<
    AttendanceStatus,
    string
  > = {
    present:
      "bg-emerald-50 text-emerald-700 border-emerald-200",

    absent:
      "bg-red-50 text-red-700 border-red-200",

    late:
      "bg-amber-50 text-amber-700 border-amber-200",

    excused:
      "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-extrabold capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function Metric({
  label,
  value,
  icon,
  type,
}: {
  label: string;
  value:
    | string
    | number;
  icon:
    React.ReactNode;
  type?:
    | "present"
    | "absent";
}) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-extrabold uppercase text-slate-600">
          {label}
        </p>

        <span
          className={
            type ===
            "present"
              ? "text-emerald-700"
              : type ===
                  "absent"
                ? "text-red-700"
                : "text-[#80570f]"
          }
        >
          {icon}
        </span>
      </div>

      <p
        className={[
          "mt-2 text-2xl font-extrabold",

          type ===
          "present"
            ? "text-emerald-700"
            : type ===
                "absent"
              ? "text-red-700"
              : "text-slate-950",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}
