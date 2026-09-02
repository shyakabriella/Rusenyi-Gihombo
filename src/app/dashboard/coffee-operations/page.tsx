"use client";

import Link from "next/link";

import type {
  LucideIcon,
} from "lucide-react";

import {
  ArrowLeftRight,
  BarChart3,
  Coffee,
  Cog,
  PackageCheck,
  ReceiptText,
  RefreshCw,
  Scale,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";

import {
  useDashboardOverview,
} from "@/hooks/use-dashboard-overview";

import type {
  CoffeeOperationMetric,
} from "@/types/dashboard";

type ModuleCard = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  metric: CoffeeOperationMetric;
};

function number(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 2,
    },
  ).format(value);
}

function metricValue(
  metric: CoffeeOperationMetric,
) {
  return `${number(metric.value)}${
    metric.unit
      ? ` ${metric.unit}`
      : ""
  }`;
}

export default function CoffeeOperationsPage() {
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
    return (
      <div className="p-5 lg:p-7">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({
            length: 12,
          }).map((_, index) => (
            <div
              key={index}
              className="h-[190px] animate-pulse rounded-xl border border-[#e6dfd5] bg-white"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-5 lg:p-7">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-semibold text-red-700">
            {error ||
              "Unable to load Coffee Operations."}
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
      </div>
    );
  }

  const live =
    data.coffee_operations;

  const modules: ModuleCard[] = [
    {
      title:
        "Coffee Purchases",
      description:
        "View all coffee purchased from farmers and Agents, including quantity, price per kilogram and total amount.",
      href:
        "/dashboard/coffee-operations/coffee-purchases",
      icon: ShoppingCart,
      metric:
        live.coffee_purchases,
    },
    {
      title:
        "Direct Farmer Deliveries",
      description:
        "Monitor farmers who deliver coffee directly to Gihombo Coffee Washing Station.",
      href:
        "/dashboard/coffee-operations/direct-farmer-deliveries",
      icon: Users,
      metric:
        live.direct_farmer_deliveries,
    },
    {
      title:
        "Agent Collections",
      description:
        "Monitor coffee collected by Agents from farmers and rural collection areas.",
      href:
        "/dashboard/coffee-operations/agent-collections",
      icon: Coffee,
      metric:
        live.agent_collections,
    },
    {
      title:
        "Field Weighing",
      description:
        "Monitor physical coffee weight recorded in the field and compare it with the Agent Collection quantity.",
      href:
        "/dashboard/coffee-operations/field-weighings",
      icon: Scale,
      metric:
        live.field_weighings,
    },
    {
      title:
        "Collection Trips",
      description:
        "Track coffee transport from confirmed field weighing to factory arrival.",
      href:
        "/dashboard/coffee-operations/collection-trips",
      icon: Truck,
      metric:
        live.collection_trips,
    },
    {
      title:
        "Factory Reception",
      description:
        "Monitor coffee arriving at the factory and compare field weight with factory weight.",
      href:
        "/dashboard/coffee-operations/factory-receptions",
      icon: PackageCheck,
      metric:
        live.factory_receptions,
    },
    {
      title:
        "Weight Reconciliation",
      description:
        "Review field and factory weight differences and identify shortages, excesses and acceptable variance.",
      href:
        "/dashboard/coffee-operations/weight-reconciliations",
      icon: Scale,
      metric:
        live.weight_reconciliations,
    },
    {
      title:
        "Coffee Lots / Batches",
      description:
        "Track coffee using unique lot numbers from reception through storage and processing.",
      href:
        "/dashboard/coffee-operations/coffee-lots",
      icon: ReceiptText,
      metric:
        live.coffee_lots,
    },
    {
      title:
        "Store / Inventory",
      description:
        "Receive coffee lots into storage and monitor current stock, bags and storage locations.",
      href:
        "/dashboard/coffee-operations/store-inventories",
      icon: PackageCheck,
      metric:
        live.store_inventories,
    },
    {
      title:
        "Stock Movements",
      description:
        "Track stock in, stock out, adjustments, transfers, processing issues and reversals.",
      href:
        "/dashboard/coffee-operations/stock-movements",
      icon: ArrowLeftRight,
      metric:
        live.stock_movements,
    },
    {
      title:
        "Coffee Processing",
      description:
        "Create processing batches and automatically issue stored coffee into washing station processing.",
      href:
        "/dashboard/coffee-operations/processing-batches",
      icon: Cog,
      metric:
        live.processing_batches,
    },
    {
      title:
        "Processing Yield & Loss",
      description:
        "Record processed coffee output and monitor yield, loss and resulting Coffee Lots.",
      href:
        "/dashboard/coffee-operations/processing-yields",
      icon: BarChart3,
      metric:
        live.processing_yield,
    },
  ];

  const flow = [
    {
      label: "Purchased",
      value: `${number(
        live.flow.purchased_kg,
      )} KG`,
    },
    {
      label: "Collections",
      value: number(
        live.flow.collected,
      ),
    },
    {
      label: "Transported",
      value: `${number(
        live.flow.transported_kg,
      )} KG`,
    },
    {
      label:
        "Factory Received",
      value: `${number(
        live.flow.factory_received_kg,
      )} KG`,
    },
    {
      label: "Stored",
      value: `${number(
        live.flow.stored_kg,
      )} KG`,
    },
  ];

  return (
    <div className="min-h-full">
      <div className="p-5 lg:p-7">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              Coffee Operations
              Overview
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-700">
              Manage coffee
              purchasing, collection,
              reception, storage and
              processing.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              void refresh()
            }
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 self-start rounded-lg border border-[#e6dfd5] bg-white px-4 text-xs font-semibold text-slate-700 transition hover:bg-[#faf7f2] disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map(
            (module) => {
              const Icon =
                module.icon;

              return (
                <Link
                  key={
                    module.title
                  }
                  href={
                    module.href
                  }
                  className="group rounded-xl border border-[#e6dfd5] bg-white p-5 shadow-[0_2px_8px_rgba(40,30,20,0.04)] transition hover:-translate-y-0.5 hover:border-[#d5b57f] hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f5e8d4] text-[#5b3b16]">
                      <Icon
                        size={21}
                        strokeWidth={
                          1.7
                        }
                      />
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-semibold text-slate-900">
                        {metricValue(
                          module.metric,
                        )}
                      </p>

                      <p className="text-[11px] font-medium text-slate-600">
                        {
                          module
                            .metric
                            .note
                        }
                      </p>
                    </div>
                  </div>

                  <h3 className="mt-5 text-[15px] font-semibold text-slate-900 group-hover:text-[#0b533a]">
                    {module.title}
                  </h3>

                  <p className="mt-2 text-xs font-medium leading-5 text-slate-700">
                    {
                      module.description
                    }
                  </p>

                  <p className="mt-4 text-xs font-semibold text-[#0b533a]">
                    Open module →
                  </p>
                </Link>
              );
            },
          )}
        </section>

        <section className="mt-6 rounded-xl border border-[#e6dfd5] bg-white p-5">
          <div>
            <h3 className="font-semibold text-slate-900">
              Today&apos;s Coffee
              Flow
            </h3>

            <p className="mt-1 text-xs font-medium text-slate-700">
              Live overview of coffee
              movement through the
              washing station.
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-5">
            {flow.map(
              (
                item,
                index,
              ) => (
                <div
                  key={
                    item.label
                  }
                  className="relative rounded-lg bg-[#faf7f2] px-4 py-4"
                >
                  <span className="text-[10px] font-semibold text-[#a37228]">
                    STEP{" "}
                    {index + 1}
                  </span>

                  <p className="mt-2 text-xs font-medium text-slate-700">
                    {item.label}
                  </p>

                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {item.value}
                  </p>
                </div>
              ),
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
