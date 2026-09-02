"use client";

import Link from "next/link";

import type {
  LucideIcon,
} from "lucide-react";

import {
  BadgeDollarSign,
  Coffee,
  HandCoins,
  PackageCheck,
  RefreshCw,
  Truck,
  UsersRound,
  Warehouse,
} from "lucide-react";

import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AccountantDashboard from "@/components/dashboard/accountant-dashboard";

import {
  useCurrentUser,
} from "@/components/auth/current-user-context";

import {
  useDashboardOverview,
} from "@/hooks/use-dashboard-overview";

import type {
  DashboardMetric,
} from "@/types/dashboard";

type StatItem = {
  label: string;
  metric: DashboardMetric;
  icon: LucideIcon;
};

function formatNumber(
  value: number,
  maximumFractionDigits = 2,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits,
    },
  ).format(value);
}

function formatTime(
  value?: string | null,
) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

function changeText(
  metric: DashboardMetric,
) {
  if (
    metric.change_percent === null
  ) {
    return "Current balance";
  }

  if (
    metric.change_percent === 0
  ) {
    return "No change";
  }

  const positive =
    metric.change_percent > 0;

  return `${positive ? "↑" : "↓"} ${Math.abs(
    metric.change_percent,
  )}% vs yesterday`;
}

function StatCard({
  item,
}: {
  item: StatItem;
}) {
  const Icon = item.icon;

  const change =
    item.metric.change_percent;

  return (
    <div className="min-w-0 rounded-xl border border-[#eee4d6] bg-white p-4 shadow-[0_2px_10px_rgba(64,43,16,0.04)]">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f6ead8] text-[#155f3d]">
          <Icon
            size={21}
            strokeWidth={1.8}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-[#28313f]">
            {item.label}
          </p>

          <div className="mt-2 flex items-end justify-between gap-2">
            <p className="truncate text-[19px] font-semibold tracking-tight text-gray-950">
              {formatNumber(
                item.metric.value,
              )}
            </p>

            <span className="shrink-0 pb-0.5 text-[9px] font-medium text-[#4b5563]">
              {item.metric.unit}
            </span>
          </div>

          <p
            className={`mt-2 text-[10px] ${
              change !== null &&
              change < 0
                ? "text-red-600"
                : "text-[#0a6a3f]"
            }`}
          >
            {changeText(
              item.metric,
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-[#eee4d6] bg-white shadow-[0_2px_10px_rgba(64,43,16,0.035)] ${className}`}
    >
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-[#f1e8dc] px-4 py-2">
        <h2 className="font-serif text-[13px] font-semibold text-gray-900">
          {title}
        </h2>

        {action}
      </div>

      {children}
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="h-[105px] animate-pulse rounded-xl border border-[#eee4d6] bg-white"
          />
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        {Array.from({
          length: 3,
        }).map((_, index) => (
          <div
            key={index}
            className="h-[295px] animate-pulse rounded-xl border border-[#eee4d6] bg-white"
          />
        ))}
      </div>
    </div>
  );
}

function AdminLiveDashboard() {
  const {
    data,
    loading,
    error,
    refresh,
  } = useDashboardOverview();

  if (
    loading &&
    !data
  ) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm font-semibold text-red-700">
          {error ||
            "Unable to load dashboard."}
        </p>

        <button
          type="button"
          onClick={() =>
            void refresh()
          }
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white"
        >
          <RefreshCw size={15} />
          Try Again
        </button>
      </div>
    );
  }

  const stats: StatItem[] = [
    {
      label:
        "Coffee Received Today",
      metric:
        data.cards
          .coffee_received_today,
      icon: Coffee,
    },
    {
      label:
        "Coffee Purchased Today",
      metric:
        data.cards
          .coffee_purchased_today,
      icon: PackageCheck,
    },
    {
      label: "Money Used",
      metric:
        data.cards
          .money_used_today,
      icon: HandCoins,
    },
    {
      label: "Available Cash",
      metric:
        data.cards.available_cash,
      icon: BadgeDollarSign,
    },
  ];

  const sourceTotal =
    data.source_breakdown.reduce(
      (total, item) =>
        total + item.value,
      0,
    );

  return (
    <div className="w-full min-w-0 space-y-3 overflow-hidden">
      {error ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              void refresh()
            }
            className="font-semibold"
          >
            Refresh
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard
            key={item.label}
            item={item}
          />
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-[0.9fr_1.25fr_1.05fr]">
        <Panel
          title="Alerts & Recent Activities"
          action={
            <Link
              href="/dashboard/audit-trail"
              className="text-[10px] font-medium text-[#16613e]"
            >
              View all
            </Link>
          }
        >
          <div className="divide-y divide-gray-100 px-3">
            {data.recent_activities
              .length ? (
              data.recent_activities.map(
                (activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 py-3"
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#17623f] text-white">
                      <Coffee
                        size={13}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <p className="truncate text-[10px] font-semibold capitalize text-gray-800">
                          {
                            activity.title
                          }
                        </p>

                        <span className="shrink-0 text-[9px] font-medium text-[#667085]">
                          {formatTime(
                            activity.created_at,
                          )}
                        </span>
                      </div>

                      <p className="mt-1 line-clamp-2 text-[9px] font-medium leading-4 text-[#5b6470]">
                        {
                          activity.description
                        }
                      </p>
                    </div>
                  </div>
                ),
              )
            ) : (
              <div className="py-10 text-center text-xs text-slate-500">
                No recent activity.
              </div>
            )}
          </div>
        </Panel>

        <Panel
          title="Coffee Received Over the Week (KG)"
          action={
            <Link
              href="/dashboard/reports"
              className="text-[10px] font-medium text-[#16613e]"
            >
              View report
            </Link>
          }
        >
          <div className="h-[245px] p-4">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={
                  data.weekly_received
                }
              >
                <CartesianGrid
                  vertical={false}
                  stroke="#eee9e1"
                />

                <XAxis
                  dataKey="day"
                  tick={{
                    fontSize: 9,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fontSize: 9,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="kg"
                  stroke="#145b38"
                  strokeWidth={2}
                  dot={{
                    fill: "#145b38",
                    r: 4,
                    strokeWidth: 0,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title="Coffee Source Breakdown (Today)"
          action={
            <Link
              href="/dashboard/reports"
              className="text-[10px] font-medium text-[#16613e]"
            >
              View report
            </Link>
          }
        >
          <div className="grid min-h-[245px] grid-cols-1 items-center gap-2 px-4 sm:grid-cols-[150px_1fr]">
            <div className="h-[160px]">
              {sourceTotal > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={
                        data.source_breakdown
                      }
                      dataKey="value"
                      innerRadius={42}
                      outerRadius={66}
                      strokeWidth={0}
                    >
                      <Cell
                        fill="#155f3d"
                      />
                      <Cell
                        fill="#d7b98b"
                      />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  No coffee today
                </div>
              )}
            </div>

            <div className="space-y-4">
              {data.source_breakdown.map(
                (source, index) => {
                  const percentage =
                    sourceTotal > 0
                      ? (
                          (source.value /
                            sourceTotal) *
                          100
                        ).toFixed(1)
                      : "0.0";

                  return (
                    <div
                      key={
                        source.name
                      }
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            index === 0
                              ? "bg-[#155f3d]"
                              : "bg-[#d7b98b]"
                          }`}
                        />

                        <span className="text-[10px] font-semibold text-slate-700">
                          {
                            source.name
                          }
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-semibold text-slate-950">
                        {formatNumber(
                          source.value,
                        )}{" "}
                        KG
                      </p>

                      <p className="text-[9px] text-slate-500">
                        {percentage}%
                      </p>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {[
          {
            label:
              "Active Agents",
            value:
              data.operations
                .active_agents,
            suffix: "",
            icon: UsersRound,
          },
          {
            label:
              "Farmers Served Today",
            value:
              data.operations
                .farmers_served_today,
            suffix: "",
            icon: UsersRound,
          },
          {
            label: "Trips Today",
            value:
              data.operations
                .trips_today,
            suffix: "",
            icon: Truck,
          },
          {
            label:
              "Coffee in Store",
            value:
              data.operations
                .store_stock_kg,
            suffix: " KG",
            icon: Warehouse,
          },
          {
            label:
              "Pending Approvals",
            value:
              data.operations
                .pending_approvals,
            suffix: "",
            icon: HandCoins,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-xl border border-[#eee4d6] bg-white p-4"
            >
              <div className="flex items-center gap-2 text-[#155f3d]">
                <Icon size={16} />

                <p className="text-[9px] font-semibold text-slate-500">
                  {item.label}
                </p>
              </div>

              <p className="mt-3 text-lg font-bold text-slate-950">
                {formatNumber(
                  item.value,
                )}
                {item.suffix}
              </p>
            </div>
          );
        })}
      </div>

      <Panel
        title="Top Coffee Agents"
        action={
          <Link
            href="/dashboard/people/agents"
            className="text-[10px] font-medium text-[#16613e]"
          >
            View agents
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
            <thead className="bg-[#faf7f1] text-[9px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">
                  Agent
                </th>

                <th className="px-4 py-3">
                  Coffee
                </th>

                <th className="px-4 py-3">
                  Purchase Value
                </th>

                <th className="px-4 py-3">
                  Collections
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {data.top_agents.length ? (
                data.top_agents.map(
                  (agent) => (
                    <tr
                      key={
                        agent.agent_id
                      }
                    >
                      <td className="px-4 py-3 text-[11px] font-semibold text-slate-800">
                        {agent.name}
                      </td>

                      <td className="px-4 py-3 text-[11px] text-slate-600">
                        {formatNumber(
                          agent.quantity_kg,
                        )}{" "}
                        KG
                      </td>

                      <td className="px-4 py-3 text-[11px] text-slate-600">
                        {formatNumber(
                          agent.total_amount,
                          0,
                        )}{" "}
                        RWF
                      </td>

                      <td className="px-4 py-3 text-[11px] text-slate-600">
                        {
                          agent.collections
                        }
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-xs text-slate-500"
                  >
                    No agent purchase
                    data available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() =>
            void refresh()
          }
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-[#e6dbc9] bg-white px-3 py-2 text-[10px] font-semibold text-slate-600 hover:bg-[#faf7f1] disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh Dashboard
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const {
    user,
    loading,
  } = useCurrentUser();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (
    user?.role ===
    "accountant"
  ) {
    return <AccountantDashboard />;
  }

  return <AdminLiveDashboard />;
}
