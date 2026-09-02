import Link from "next/link";

import {
  ContactRound,
  Tractor,
  Truck,
  Users,
} from "lucide-react";

const sections = [
  {
    title: "Agents",
    description:
      "Manage coffee collection Agents, assigned areas, cash position and performance.",
    href: "/dashboard/people/agents",
    icon: Users,
  },
  {
    title: "Farmers",
    description:
      "Manage farmer profiles, locations, coffee deliveries and payment history.",
    href: "/dashboard/people/farmers",
    icon: Tractor,
  },
  {
    title: "Drivers",
    description:
      "Manage Drivers, assignments and coffee transport activities.",
    href: "/dashboard/people/drivers",
    icon: Truck,
  },
  {
    title: "Workers",
    description:
      "Manage factory workers and information used for payroll.",
    href: "/dashboard/people/workers",
    icon: ContactRound,
  },
];

export default function PeoplePage() {
  return (
    <div className="min-h-full">
      <div className="p-5 lg:p-7">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-950">
            People Management
          </h2>

          <p className="mt-1 max-w-2xl text-sm font-medium text-slate-700">
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
                className="group rounded-xl border border-[#e6dfd5] bg-white p-5 shadow-[0_2px_8px_rgba(40,30,20,0.04)] transition hover:-translate-y-0.5 hover:border-[#d5b57f] hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f5e8d4] text-[#5b3b16]">
                  <Icon
                    size={21}
                    strokeWidth={1.8}
                  />
                </div>

                <h3 className="mt-4 text-[15px] font-semibold text-slate-950 transition group-hover:text-[#0b533a]">
                  {section.title}
                </h3>

                <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
                  {section.description}
                </p>

                <p className="mt-4 text-xs font-semibold text-[#0b533a]">
                  Open module →
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
