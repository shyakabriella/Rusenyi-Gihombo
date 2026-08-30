"use client";

import {
  BadgeDollarSign,
  CircleDollarSign,
  Coffee,
  HandCoins,
  Landmark,
  PackageCheck,
  ReceiptText,
  Users,
} from "lucide-react";

import {
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const stats = [
  {
    label: "Coffee Purchased Today",
    value: "3,420",
    suffix: "KG",
    growth: "8.4%",
    icon: PackageCheck,
  },
  {
    label: "Coffee Received Today",
    value: "3,850",
    suffix: "KG",
    growth: "12.5%",
    icon: Coffee,
  },
  {
    label: "Money Used Today",
    value: "8,745,000",
    suffix: "RWF",
    growth: "10.3%",
    icon: HandCoins,
  },
  {
    label: "Available Cash",
    value: "24,560,000",
    suffix: "RWF",
    growth: "5.7%",
    icon: BadgeDollarSign,
  },
];

const weeklyPurchases = [
  { day: "Sat", kg: 2260 },
  { day: "Sun", kg: 2780 },
  { day: "Mon", kg: 2940 },
  { day: "Tue", kg: 3710 },
  { day: "Wed", kg: 3540 },
  { day: "Thu", kg: 3150 },
  { day: "Fri", kg: 3420 },
];

const sourceData = [
  {
    name: "Agents",
    value: 2240,
  },
  {
    name: "Direct Farmers",
    value: 1180,
  },
];

const financeActivities = [
  {
    title: "Farmer payment recorded",
    description:
      "2,135,000 RWF paid to 23 farmers.",
    time: "09:20 AM",
    icon: ReceiptText,
  },
  {
    title: "Agent funds allocated",
    description:
      "1,500,000 RWF allocated to a coffee collection Agent.",
    time: "09:05 AM",
    icon: Users,
  },
  {
    title: "Coffee purchase recorded",
    description:
      "620 KG coffee purchase submitted by an Agent.",
    time: "08:45 AM",
    icon: Coffee,
  },
  {
    title: "Operational expense recorded",
    description:
      "Fuel expense of 185,000 RWF recorded.",
    time: "08:20 AM",
    icon: CircleDollarSign,
  },
];

function StatCard({
  item,
}: {
  item: (typeof stats)[number];
}) {
  const Icon = item.icon;

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
            <p className="text-[19px] font-semibold tracking-tight text-gray-950">
              {item.value}
            </p>

            <span className="pb-0.5 text-[9px] font-medium text-[#4b5563]">
              {item.suffix}
            </span>
          </div>

          <p className="mt-2 text-[10px] text-[#4b5563]">
            <span className="font-medium text-[#0a6a3f]">
              ↑ {item.growth}
            </span>{" "}
            vs yesterday
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
}: {
  title: string;
  action?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#eee4d6] bg-white shadow-[0_2px_10px_rgba(64,43,16,0.035)]">
      <div className="flex h-12 items-center justify-between border-b border-[#f1e8dc] px-4">
        <h2 className="font-serif text-[13px] font-semibold text-gray-900">
          {title}
        </h2>

        {action && (
          <button
            type="button"
            className="text-[10px] font-medium text-[#16613e]"
          >
            {action}
          </button>
        )}
      </div>

      {children}
    </section>
  );
}

export default function AccountantDashboard() {
  return (
    <div className="w-full min-w-0 space-y-3 overflow-hidden">
      {/* 4 Accountant KPIs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard
            key={item.label}
            item={item}
          />
        ))}
      </div>

      {/* Coffee + finance overview */}
      <div className="grid gap-3 xl:grid-cols-[1.4fr_1fr_1fr]">
        <Panel
          title="Coffee Purchased Over the Week (KG)"
          action="View report"
        >
          <div className="h-[250px] p-4">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={weeklyPurchases}
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
          title="Coffee Purchase Source"
          action="View report"
        >
          <div className="flex min-h-[250px] flex-col items-center justify-center px-4">
            <div className="h-[145px] w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={sourceData}
                    dataKey="value"
                    innerRadius={38}
                    outerRadius={62}
                    strokeWidth={0}
                    fill="#155f3d"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-[10px]">
                <span>
                  From Agents
                </span>

                <strong>
                  2,240 KG
                </strong>
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <span>
                  Direct Farmers
                </span>

                <strong>
                  1,180 KG
                </strong>
              </div>

              <div className="flex items-center justify-between border-t border-[#e4bb7a] pt-2 text-[11px]">
                <strong>Total</strong>

                <strong className="text-[#155f3d]">
                  3,420 KG
                </strong>
              </div>
            </div>
          </div>
        </Panel>

        <Panel
          title="Cash Summary"
          action="View finance"
        >
          <div className="space-y-4 p-4">
            <div className="flex justify-between text-[10px]">
              <span className="text-[#475467]">
                Opening Cash
              </span>

              <strong>
                16,250,000 RWF
              </strong>
            </div>

            <div className="flex justify-between text-[10px]">
              <span className="text-[#475467]">
                Cash Received
              </span>

              <strong className="text-emerald-700">
                18,325,000 RWF
              </strong>
            </div>

            <div className="flex justify-between text-[10px]">
              <span className="text-[#475467]">
                Cash Used
              </span>

              <strong className="text-red-500">
                10,015,000 RWF
              </strong>
            </div>

            <div className="border-t border-[#dba557] pt-4">
              <div className="flex justify-between">
                <strong className="text-[11px]">
                  Available Cash
                </strong>

                <strong className="text-[13px] text-[#15613d]">
                  24,560,000 RWF
                </strong>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Finance-specific information */}
      <div className="grid gap-3 xl:grid-cols-[1.15fr_1fr_1fr]">
        <Panel
          title="Recent Coffee & Finance Activities"
          action="View all"
        >
          <div className="divide-y divide-gray-100 px-3">
            {financeActivities.map(
              (activity) => {
                const Icon =
                  activity.icon;

                return (
                  <div
                    key={`${activity.title}-${activity.time}`}
                    className="flex items-start gap-3 py-3"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#edf5ee] text-[#155f3d]">
                      <Icon
                        size={15}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <p className="truncate text-[10px] font-semibold text-gray-800">
                          {
                            activity.title
                          }
                        </p>

                        <span className="shrink-0 text-[9px] text-[#667085]">
                          {
                            activity.time
                          }
                        </span>
                      </div>

                      <p className="mt-1 text-[9px] text-[#5b6470]">
                        {
                          activity.description
                        }
                      </p>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </Panel>

        <Panel
          title="Agent Funds Summary"
          action="View finance"
        >
          <div className="space-y-4 p-4">
            <div className="flex items-center gap-3 rounded-lg bg-[#faf7f2] p-3">
              <Landmark
                size={18}
                className="text-[#155f3d]"
              />

              <div className="flex-1">
                <p className="text-[10px] text-slate-500">
                  Allocated to Agents
                </p>

                <p className="mt-1 text-sm font-semibold">
                  12,500,000 RWF
                </p>
              </div>
            </div>

            <div className="flex justify-between text-[10px]">
              <span>
                Used by Agents
              </span>

              <strong>
                8,745,000 RWF
              </strong>
            </div>

            <div className="flex justify-between text-[10px]">
              <span>
                Remaining with Agents
              </span>

              <strong className="text-[#155f3d]">
                3,755,000 RWF
              </strong>
            </div>

            <div className="flex justify-between text-[10px]">
              <span>
                Agents with Outstanding Cash
              </span>

              <strong>
                6
              </strong>
            </div>
          </div>
        </Panel>

        <Panel
          title="Farmer Payments Today"
          action="View report"
        >
          <div className="space-y-4 p-4">
            <div className="flex justify-between text-[10px]">
              <span>
                Farmers Paid
              </span>

              <strong>
                23
              </strong>
            </div>

            <div className="flex justify-between text-[10px]">
              <span>
                Total Paid
              </span>

              <strong className="text-[#155f3d]">
                2,135,000 RWF
              </strong>
            </div>

            <div className="flex justify-between text-[10px]">
              <span>
                Pending Payments
              </span>

              <strong>
                4
              </strong>
            </div>

            <div className="flex justify-between text-[10px]">
              <span>
                Pending Amount
              </span>

              <strong className="text-[#a76016]">
                420,000 RWF
              </strong>
            </div>

            <div className="border-t border-[#e5ded4] pt-3">
              <div className="flex justify-between text-[10px]">
                <span>
                  Average Buying Price
                </span>

                <strong>
                  2,550 RWF/KG
                </strong>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
