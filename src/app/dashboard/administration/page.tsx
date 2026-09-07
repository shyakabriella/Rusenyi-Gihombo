import Link from "next/link";

import {
  ArrowRight,
  BadgeDollarSign,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Settings2,
} from "lucide-react";

import type {
  LucideIcon,
} from "lucide-react";

import AdminOnly from "@/components/auth/admin-only";

type AdministrationModule = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  label: string;
};

const modules: AdministrationModule[] = [
  {
    title: "Location Management",
    description:
      "Manage provinces, districts, sectors, cells, villages and collection points.",
    href: "/dashboard/administration/locations",
    icon: MapPin,
    label: "Geographic Setup",
  },
  {
    title: "Coffee Season",
    description:
      "Create and manage coffee operational seasons, activation and closure.",
    href: "/dashboard/administration/coffee-seasons",
    icon: CalendarDays,
    label: "Season Setup",
  },
  {
    title: "Coffee Price Management",
    description:
      "Configure coffee buying prices per kilogram, season and coffee type.",
    href: "/dashboard/administration/coffee-prices",
    icon: BadgeDollarSign,
    label: "Pricing Setup",
  },
];

export default function AdministrationPage() {
  return (
    <AdminOnly>
      <div className="space-y-5">
        {/* TOP SUMMARY */}
        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            title="Configuration Modules"
            value="3"
            subtitle="Available modules"
            icon={Settings2}
          />

          <SummaryCard
            title="Operational Setup"
            value="Ready"
            subtitle="Core settings available"
            icon={CheckCircle2}
          />

          <SummaryCard
            title="Administration Access"
            value="Admin"
            subtitle="Restricted management area"
            icon={Settings2}
          />
        </section>

        {/* MODULE HEADER */}
        <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              System Configuration
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-600">
              Manage the main configuration used by coffee operations.
            </p>
          </div>

          <p className="text-xs font-semibold text-slate-500">
            Select a module to continue
          </p>
        </section>

        {/* MODULES */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <Link
                key={module.href}
                href={module.href}
                className="
                  group
                  rounded-xl
                  border
                  border-[#e5ded4]
                  bg-white
                  p-5
                  shadow-sm
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-[#d4c5b2]
                  hover:shadow-md
                "
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#f6e7d2]
                      text-[#075b38]
                      transition-transform
                      duration-200
                      group-hover:scale-105
                    "
                  >
                    <Icon
                      size={22}
                      strokeWidth={2}
                    />
                  </div>

                  <span
                    className="
                      rounded-md
                      bg-emerald-50
                      px-2.5
                      py-1
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-wide
                      text-emerald-700
                    "
                  >
                    Available
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    {module.label}
                  </p>

                  <h3 className="mt-2 text-lg font-bold text-slate-950">
                    {module.title}
                  </h3>

                  <p className="mt-2 min-h-[48px] text-sm font-medium leading-6 text-slate-600">
                    {module.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#eee7dd] pt-3">
                  <span className="text-sm font-semibold text-slate-700">
                    Open module
                  </span>

                  <span
                    className="
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-md
                      border
                      border-[#e0d5c7]
                      bg-white
                      text-slate-600
                      transition-all
                      duration-200
                      group-hover:translate-x-0.5
                      group-hover:border-[#075b38]
                      group-hover:bg-[#075b38]
                      group-hover:text-white
                    "
                  >
                    <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            );
          })}
        </section>

      
      </div>
    </AdminOnly>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-[#e5ded4] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f6e7d2] text-[#075b38]">
          <Icon size={20} />
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-600">
            {title}
          </p>

          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-xl font-bold text-slate-950">
              {value}
            </p>
          </div>

          <p className="mt-1 text-xs font-medium text-slate-500">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

function OverviewItem({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-[#eee7dd] p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <div className="flex gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f8ead4] text-xs font-bold text-[#80570f]">
          {number}
        </span>

        <div>
          <p className="font-bold text-slate-900">
            {title}
          </p>

          <p className="mt-1 text-sm font-medium leading-5 text-slate-600">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
