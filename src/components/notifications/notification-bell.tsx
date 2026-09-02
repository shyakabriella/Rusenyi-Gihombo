"use client";

import Link from "next/link";

import {
  Bell,
  Check,
  LoaderCircle,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  getNotifications,
  getNotificationSummary,
  markNotificationRead,
} from "@/services/notification-service";

import type {
  SystemNotification,
} from "@/types/notification";

export default function NotificationBell() {
  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [unread, setUnread] =
    useState(0);

  const [items, setItems] =
    useState<SystemNotification[]>(
      [],
    );

  const containerRef =
    useRef<HTMLDivElement>(
      null,
    );

  const load =
    useCallback(async () => {
      try {
        const [summary, list] =
          await Promise.all([
            getNotificationSummary(),

            getNotifications({
              per_page: 5,
            }),
          ]);

        setUnread(
          summary.unread,
        );

        setItems(
          list.items,
        );
      } catch {
        // Do not disturb the dashboard if notifications fail.
      }
    }, []);

  useEffect(() => {
    void load();

    const interval =
      window.setInterval(
        () => {
          void load();
        },
        30000,
      );

    return () =>
      window.clearInterval(
        interval,
      );
  }, [load]);

  useEffect(() => {
    function outside(
      event: MouseEvent,
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      outside,
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        outside,
      );
  }, []);

  async function toggle() {
    const next =
      !open;

    setOpen(next);

    if (next) {
      setLoading(true);

      await load();

      setLoading(false);
    }
  }

  async function markRead(
    notification: SystemNotification,
  ) {
    if (
      notification.is_read
    ) {
      return;
    }

    try {
      await markNotificationRead(
        notification.id,
      );

      setItems(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              notification.id
                ? {
                    ...item,
                    is_read: true,
                  }
                : item,
          ),
      );

      setUnread(
        (current) =>
          Math.max(
            0,
            current - 1,
          ),
      );
    } catch {
      // Notification can still be opened.
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        aria-label="Notifications"
        onClick={() =>
          void toggle()
        }
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100"
      >
        <Bell size={19} />

        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-extrabold text-white">
            {unread > 99
              ? "99+"
              : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-[150] w-[340px] overflow-hidden rounded-xl border border-slate-300 bg-white shadow-xl sm:w-[390px]">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <p className="font-extrabold text-slate-950">
                Notifications
              </p>

              <p className="text-xs font-medium text-slate-600">
                {unread} unread
              </p>
            </div>

            <Link
              href="/dashboard/notifications"
              onClick={() =>
                setOpen(false)
              }
              className="text-xs font-bold text-[#075b38]"
            >
              View All
            </Link>
          </div>

          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <LoaderCircle
                size={25}
                className="animate-spin text-[#075b38]"
              />
            </div>
          ) : items.length ? (
            <div className="max-h-[410px] overflow-y-auto">
              {items.map(
                (
                  notification,
                ) => (
                  <NotificationItem
                    key={
                      notification.id
                    }
                    notification={
                      notification
                    }
                    markRead={() =>
                      void markRead(
                        notification,
                      )
                    }
                    close={() =>
                      setOpen(false)
                    }
                  />
                ),
              )}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Bell
                size={30}
                className="mx-auto text-slate-400"
              />

              <p className="mt-2 text-sm font-bold">
                No notifications
              </p>
            </div>
          )}

          <Link
            href="/dashboard/notifications"
            onClick={() =>
              setOpen(false)
            }
            className="block border-t border-slate-200 px-4 py-3 text-center text-sm font-bold text-[#075b38] hover:bg-slate-50"
          >
            View All Notifications
          </Link>
        </div>
      )}
    </div>
  );
}

function NotificationItem({
  notification,
  markRead,
  close,
}: {
  notification: SystemNotification;
  markRead: () => void;
  close: () => void;
}) {
  const content = (
    <div
      className={`flex gap-3 px-4 py-3 hover:bg-slate-50 ${
        notification.is_read
          ? "bg-white"
          : "bg-[#fffaf1]"
      }`}
    >
      <div
        className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          notification.type ===
          "approval_approved"
            ? "bg-emerald-100 text-emerald-800"
            : "bg-[#f3e2c4] text-[#80570f]"
        }`}
      >
        {notification.type ===
        "approval_approved" ? (
          <Check
            size={15}
          />
        ) : (
          <Bell
            size={15}
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex gap-2">
          <p
            className={`line-clamp-1 text-sm ${
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
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#075b38]" />
          )}
        </div>

        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
          {
            notification.message
          }
        </p>

        <p className="mt-1 text-[11px] font-medium text-slate-500">
          {formatTime(
            notification.created_at,
          )}
        </p>
      </div>
    </div>
  );

  if (
    notification.action_url
  ) {
    return (
      <Link
        href={
          notification.action_url
        }
        onClick={() => {
          markRead();
          close();
        }}
        className="block border-b border-slate-100"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={markRead}
      className="block w-full border-b border-slate-100 text-left"
    >
      {content}
    </button>
  );
}

function formatTime(
  value?: string | null,
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}
