import Link from "next/link";

import {
  ContactRound,
  Tractor,
  Truck,
  Users,
} from "lucide-react";

import DashboardTopbar from "@/components/layout/dashboard-topbar";

const sections = [
  {
    title: "Agents",
    description:
      "Manage coffee collection Agents, assigned areas, cash position and performance.",
    href: "/dashboard/agents",
    icon: Users,
  },
  {
    title: "Farmers",
    description:
      "Manage farmer profiles, locations, coffee deliveries and payment history.",
    href: "/dashboard/farmers",
    icon: Tractor,
  },
  {
    title: "Drivers",
    description:
      "Manage Drivers, assignments and coffee transport activities.",
    href: "/dashboard/drivers",
    icon: Truck,
  },
  {
    title: "Workers",
    description:
      "Manage factory workers and information used for payroll.",
    href: "/dashboard/workers",
    icon: ContactRound,
  },
];

export default function PeoplePage() {
  return (
    <div className="min-h-full">
      <DashboardTopbar title="People" />

      <div className="p-5 lg:p-7">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            People Management
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage people involved in coffee collection,
            transport and factory operations.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <Link
                href={section.href}
                key={section.title}
                className="rounded-xl border border-[#e6dfd5] bg-white p-5 transition hover:border-[#d5b57f] hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f5e8d4] text-[#5b3b16]">
                  <Icon size={21} />
                </div>

                <h3 className="mt-4 font-semibold">
                  {section.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {section.description}
                </p>

                <p className="mt-4 text-xs font-semibold text-[#0b533a]">
                  Open →
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
