"use client";

import Link from "next/link";

import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Clock3,
  Eye,
  LoaderCircle,
  Search,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getNotification,
  getNotifications,
  getNotificationSummary,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
} from "@/services/notification-service";

import type {
  NotificationSummary,
  SystemNotification,
} from "@/types/notification";

const emptySummary: NotificationSummary = {
  total: 0,
  unread: 0,
  read: 0,
  today: 0,
  approval_notifications: 0,
};

const inputClass =
  "h-11 w-full rounded-lg border border-slate-400 bg-white px-3 text-sm font-medium text-slate-950 outline-none focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

export default function NotificationManagement() {
  const [items, setItems] =
    useState<SystemNotification[]>(
      [],
    );

  const [summary, setSummary] =
    useState<NotificationSummary>(
      emptySummary,
    );

  const [search, setSearch] =
    useState("");

  const [readStatus, setReadStatus] =
    useState("");

  const [moduleFilter, setModuleFilter] =
    useState("");

  const [filters, setFilters] =
    useState({
      search: "",
      readStatus: "",
      module: "",
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
    useState<SystemNotification | null>(
      null,
    );

  const load =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const [list, totals] =
          await Promise.all([
            getNotifications({
              search:
                filters.search ||
                undefined,

              read_status:
                filters.readStatus
                  ? (
                      filters.readStatus as
                        | "read"
                        | "unread"
                    )
                  : undefined,

              module:
                filters.module ||
                undefined,

              page,
              per_page: 15,
            }),

            getNotificationSummary(),
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
    }, [
      filters,
      page,
    ]);

  useEffect(() => {
    void load();
  }, [load]);

  function applyFilters() {
    setFilters({
      search:
        search.trim(),

      readStatus,

      module:
        moduleFilter,
    });

    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setReadStatus("");
    setModuleFilter("");

    setFilters({
      search: "",
      readStatus: "",
      module: "",
    });

    setPage(1);
  }

  async function openNotification(
    notification: SystemNotification,
  ) {
    setError("");

    try {
      const result =
        await getNotification(
          notification.id,
        );

      setViewing(result);

      if (
        !notification.is_read
      ) {
        setItems(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                notification.id
                  ? {
                      ...item,
                      is_read: true,
                      read_at:
                        result.read_at,
                    }
                  : item,
            ),
        );

        setSummary(
          (current) => ({
            ...current,

            unread:
              Math.max(
                0,
                current.unread - 1,
              ),

            read:
              current.read + 1,
          }),
        );
      }
    } catch (error) {
      setError(
        errorMessage(error),
      );
    }
  }

  async function toggleRead(
    notification: SystemNotification,
  ) {
    setBusy(true);
    setError("");

    try {
      const updated =
        notification.is_read
          ? await markNotificationUnread(
              notification.id,
            )
          : await markNotificationRead(
              notification.id,
            );

      setItems(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              notification.id
                ? updated
                : item,
          ),
      );

      await refreshSummary();
    } catch (error) {
      setError(
        errorMessage(error),
      );
    } finally {
      setBusy(false);
    }
  }

  async function markAllRead() {
    if (
      summary.unread === 0
    ) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const count =
        await markAllNotificationsRead();

      setSuccess(
        `${count} notification${
          count === 1 ? "" : "s"
        } marked as read.`,
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

  async function refreshSummary() {
    try {
      setSummary(
        await getNotificationSummary(),
      );
    } catch {
      // List action already succeeded.
    }
  }

  return (
    <div className="space-y-5 text-slate-950">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">
            Notifications
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-700">
            Keep track of approvals,
            financial actions and system
            activities that need your
            attention.
          </p>
        </div>

        <button
          type="button"
          disabled={
            busy ||
            summary.unread === 0
          }
          onClick={() =>
            void markAllRead()
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#075b38] bg-white px-4 text-sm font-bold text-[#075b38] hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CheckCheck size={17} />
          Mark All Read
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Unread"
          value={String(
            summary.unread,
          )}
          icon={
            <BellRing
              size={19}
            />
          }
        />

        <Metric
          title="Today"
          value={String(
            summary.today,
          )}
          icon={
            <Clock3
              size={19}
            />
          }
        />

        <Metric
          title="Read"
          value={String(
            summary.read,
          )}
          icon={
            <Check
              size={19}
            />
          }
        />

        <Metric
          title="Total"
          value={String(
            summary.total,
          )}
          icon={
            <Bell
              size={19}
            />
          }
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
              onChange={(
                event,
              ) =>
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
              placeholder="Search notifications..."
              className="h-11 w-full rounded-lg border border-slate-400 bg-white pl-9 pr-3 text-sm font-medium outline-none placeholder:text-slate-600 focus:border-[#075b38]"
            />
          </div>

          <select
            value={readStatus}
            onChange={(
              event,
            ) =>
              setReadStatus(
                event.target.value,
              )
            }
            className={
              inputClass
            }
          >
            <option value="">
              All Statuses
            </option>

            <option value="unread">
              Unread
            </option>

            <option value="read">
              Read
            </option>
          </select>

          <select
            value={moduleFilter}
            onChange={(
              event,
            ) =>
              setModuleFilter(
                event.target.value,
              )
            }
            className={
              inputClass
            }
          >
            <option value="">
              All Modules
            </option>

            <option value="approval">
              Approvals
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

      <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <LoaderCircle
              size={32}
              className="animate-spin text-[#075b38]"
            />
          </div>
        ) : items.length ? (
          <div>
            {items.map(
              (
                notification,
              ) => (
                <NotificationRow
                  key={
                    notification.id
                  }
                  notification={
                    notification
                  }
                  busy={busy}
                  open={() =>
                    void openNotification(
                      notification,
                    )
                  }
                  toggleRead={() =>
                    void toggleRead(
                      notification,
                    )
                  }
                />
              ),
            )}
          </div>
        ) : (
          <div className="py-20 text-center">
            <Bell
              size={44}
              className="mx-auto text-slate-400"
            />

            <p className="mt-3 text-base font-bold">
              No notifications found.
            </p>

            <p className="mt-1 text-sm text-slate-600">
              New system activities will
              appear here.
            </p>
          </div>
        )}

        <Pagination
          page={page}
          lastPage={lastPage}
          total={total}
          setPage={setPage}
        />
      </div>

      {viewing && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
            <div className="border-b border-slate-300 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase text-[#80570f]">
                    {
                      viewing.notification_code
                    }
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold">
                    {
                      viewing.title
                    }
                  </h2>

                  <p className="mt-1 text-xs font-medium text-slate-600">
                    {formatDateTime(
                      viewing.created_at,
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setViewing(
                      null,
                    )
                  }
                  className="h-9 rounded-lg border border-slate-400 px-4 text-sm font-bold"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <p className="text-sm font-medium leading-7 text-slate-800">
                {
                  viewing.message
                }
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <Detail
                  title="Type"
                  value={label(
                    viewing.type,
                  )}
                />

                <Detail
                  title="Module"
                  value={
                    viewing.module
                      ? label(
                          viewing.module,
                        )
                      : "—"
                  }
                />

                <Detail
                  title="Reference"
                  value={
                    viewing.reference_code ??
                    "—"
                  }
                />

                <Detail
                  title="Created By"
                  value={
                    viewing.creator
                      ?.name ??
                    "System"
                  }
                />
              </div>

              {viewing.action_url && (
                <Link
                  href={
                    viewing.action_url
                  }
                  onClick={() =>
                    setViewing(
                      null,
                    )
                  }
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white"
                >
                  Open Related Page
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationRow({
  notification,
  busy,
  open,
  toggleRead,
}: {
  notification: SystemNotification;
  busy: boolean;
  open: () => void;
  toggleRead: () => void;
}) {
  return (
    <div
      className={`flex flex-col gap-4 border-b border-slate-200 px-4 py-4 transition sm:flex-row sm:items-center ${
        notification.is_read
          ? "bg-white"
          : "bg-[#fffaf1]"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
          notification.is_read
            ? "bg-slate-100 text-slate-600"
            : "bg-[#f4e1bd] text-[#80570f]"
        }`}
      >
        {notification.type ===
        "approval_approved" ? (
          <Check
            size={19}
          />
        ) : (
          <BellRing
            size={19}
          />
        )}
      </div>

      <button
        type="button"
        onClick={open}
        className="min-w-0 flex-1 text-left"
      >
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={`text-sm ${
              notification.is_read
                ? "font-bold"
                : "font-extrabold"
            }`}
          >
            {
              notification.title
            }
          </p>

          {!notification.is_read && (
            <span className="h-2 w-2 rounded-full bg-[#075b38]" />
          )}
        </div>

        <p className="mt-1 line-clamp-2 text-sm text-slate-650">
          {
            notification.message
          }
        </p>

        <div className="mt-2 flex flex-wrap gap-3 text-xs font-medium text-slate-600">
          <span>
            {formatDateTime(
              notification.created_at,
            )}
          </span>

          {notification.reference_code && (
            <span className="font-bold text-[#80570f]">
              {
                notification.reference_code
              }
            </span>
          )}
        </div>
      </button>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          title="View"
          onClick={open}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-400 bg-white hover:bg-slate-100"
        >
          <Eye size={15} />
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={
            toggleRead
          }
          className="h-9 rounded-lg border border-slate-400 bg-white px-3 text-xs font-bold hover:bg-slate-100 disabled:opacity-50"
        >
          {notification.is_read
            ? "Mark Unread"
            : "Mark Read"}
        </button>
      </div>
    </div>
  );
}

function Metric({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-extrabold uppercase text-slate-700">
          {title}
        </p>

        <span className="text-[#075b38]">
          {icon}
        </span>
      </div>

      <p className="mt-2 text-2xl font-extrabold">
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
    <div className="rounded-lg border border-slate-300 bg-slate-50 p-4">
      <p className="text-xs font-extrabold uppercase text-slate-600">
        {title}
      </p>

      <p className="mt-1 text-sm font-bold">
        {value}
      </p>
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
        {total} notifications · Page{" "}
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

function errorMessage(
  error: unknown,
) {
  return error instanceof Error
    ? error.message
    : "Something went wrong.";
}
