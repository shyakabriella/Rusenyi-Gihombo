import Link from "next/link";

import {
  Coffee,
  PackageCheck,
  ReceiptText,
  Scale,
  ShoppingCart,
  Users,
  Truck,
  ArrowLeftRight,
  Cog,
  BarChart3,
} from "lucide-react";

const modules = [
  {
    title: "Coffee Purchases",
    description:
      "View all coffee purchased from farmers and Agents, including quantity, price per kilogram and total amount.",
    href: "/dashboard/coffee-operations/coffee-purchases",
    icon: ShoppingCart,
    value: "3,420 KG",
    note: "Purchased today",
  },
  {
    title: "Direct Farmer Deliveries",
    description:
      "Monitor farmers who deliver coffee directly to Gihombo Coffee Washing Station.",
    href: "/dashboard/coffee-operations/direct-farmer-deliveries",
    icon: Users,
    value: "385",
    note: "Farmers served",
  },
  {
    title: "Agent Collections",
    description:
      "Monitor coffee collected by Agents from farmers and rural collection areas.",
    href: "/dashboard/coffee-operations/agent-collections",
    icon: Coffee,
    value: "2,240 KG",
    note: "Collected by Agents",
  },
  {
    title: "Field Weighing",
    description:
      "Monitor physical coffee weight recorded in the field and compare it with the Agent Collection quantity.",
    href: "/dashboard/coffee-operations/field-weighings",
    icon: Scale,
    value: "0 KG",
    note: "Field weighed",
  },
  {
    title: "Collection Trips",
    description:
      "Track coffee transport from confirmed field weighing to factory arrival.",
    href: "/dashboard/coffee-operations/collection-trips",
    icon: Truck,
    value: "0",
    note: "Transport trips",
  },
  {
    title: "Factory Reception",
    description:
      "Monitor coffee arriving at the factory and compare field weight with factory weight.",
    href: "/dashboard/coffee-operations/factory-receptions",
    icon: PackageCheck,
    value: "3,850 KG",
    note: "Received today",
  },
  {
    title: "Weight Reconciliation",
    description:
      "Review field and factory weight differences and identify shortages, excesses and acceptable variance.",
    href: "/dashboard/coffee-operations/weight-reconciliations",
    icon: Scale,
    value: "0",
    note: "Pending reconciliation",
  },
  {
    title: "Coffee Lots / Batches",
    description:
      "Track coffee using unique lot numbers from reception through storage and processing.",
    href: "/dashboard/coffee-operations/coffee-lots",
    icon: ReceiptText,
    value: "24",
    note: "Active lots",
  },
  {
    title: "Store / Inventory",
    description:
      "Receive coffee lots into storage and monitor current stock, bags and storage locations.",
    href: "/dashboard/coffee-operations/store-inventories",
    icon: PackageCheck,
    value: "0 KG",
    note: "Current stock",
  },
  {
    title: "Stock Movements",
    description:
      "Track stock in, stock out, adjustments, transfers, processing issues and reversals.",
    href: "/dashboard/coffee-operations/stock-movements",
    icon: ArrowLeftRight,
    value: "0",
    note: "Inventory movements",
  },

  {
    title: "Coffee Processing",
    description:
      "Create processing batches and automatically issue stored coffee into washing station processing.",
    href: "/dashboard/coffee-operations/processing-batches",
    icon: Cog,
    value: "0",
    note: "Active processing batches",
  },

  {
    title: "Processing Yield & Loss",
    description:
      "Record processed coffee output and monitor yield, loss and resulting Coffee Lots.",
    href: "/dashboard/coffee-operations/processing-yields",
    icon: BarChart3,
    value: "0%",
    note: "Average processing yield",
  },
];

export default function CoffeeOperationsPage() {
  return (
    <div className="min-h-full">
<div className="p-5 lg:p-7">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-950">
            Coffee Operations Overview
          </h2>

          <p className="mt-1 text-sm font-medium text-slate-700">
            Manage coffee purchasing, collection,
            reception and lot tracking.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <Link
                key={module.title}
                href={module.href}
                className="group rounded-xl border border-[#e6dfd5] bg-white p-5 shadow-[0_2px_8px_rgba(40,30,20,0.04)] transition hover:-translate-y-0.5 hover:border-[#d5b57f] hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f5e8d4] text-[#5b3b16]">
                    <Icon
                      size={21}
                      strokeWidth={1.7}
                    />
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-900">
                      {module.value}
                    </p>

                    <p className="text-[11px] font-medium text-slate-600">
                      {module.note}
                    </p>
                  </div>
                </div>

                <h3 className="mt-5 text-[15px] font-semibold text-slate-900 group-hover:text-[#0b533a]">
                  {module.title}
                </h3>

                <p className="mt-2 text-xs font-medium leading-5 text-slate-700">
                  {module.description}
                </p>

                <p className="mt-4 text-xs font-semibold text-[#0b533a]">
                  Open module →
                </p>
              </Link>
            );
          })}
        </section>

        <section className="mt-6 rounded-xl border border-[#e6dfd5] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">
                Today's Coffee Flow
              </h3>

              <p className="mt-1 text-xs font-medium text-slate-700">
                Quick overview of coffee movement
                through the washing station.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-5">
            {[
              ["Purchased", "3,420 KG"],
              ["Collected", "3,850 KG"],
              ["Transported", "3,810 KG"],
              ["Factory Received", "3,780 KG"],
              ["Stored", "3,760 KG"],
            ].map(([label, value], index) => (
              <div
                key={label}
                className="relative rounded-lg bg-[#faf7f2] px-4 py-4"
              >
                <span className="text-[10px] font-semibold text-[#a37228]">
                  STEP {index + 1}
                </span>

                <p className="mt-2 text-xs font-medium text-slate-700">
                  {label}
                </p>

                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
