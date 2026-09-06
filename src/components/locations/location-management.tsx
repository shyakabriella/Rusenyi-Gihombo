"use client";

import {
  LoaderCircle,
  MapPinned,
  Search,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getCells,
  getCollectionPoints,
  getDistricts,
  getProvinces,
  getSectors,
  getVillages,
  updateLocationStatus,
} from "@/services/location-service";

type Tab =
  | "provinces"
  | "districts"
  | "sectors"
  | "cells"
  | "villages"
  | "collection-points";

const tabs: Array<{
  key: Tab;
  label: string;
}> = [
  {
    key: "provinces",
    label: "Provinces",
  },
  {
    key: "districts",
    label: "Districts",
  },
  {
    key: "sectors",
    label: "Sectors",
  },
  {
    key: "cells",
    label: "Cells",
  },
  {
    key: "villages",
    label: "Villages",
  },
  {
    key: "collection-points",
    label: "Collection Points",
  },
];

type Row = {
  id: number;
  name: string;
  is_active: boolean;
  code?: string;
};

export default function LocationManagement() {
  const [tab, setTab] =
    useState<Tab>(
      "provinces",
    );

  const [rows, setRows] =
    useState<Row[]>([]);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [lastPage, setLastPage] =
    useState(1);

  const load =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const filters = {
          search,
          status,
          page,
          per_page:
            tab === "districts"
              ? 50
              : 20,
        };

        let response;

        switch (tab) {
          case "provinces":
            response =
              await getProvinces(
                filters,
              );
            break;

          case "districts":
            response =
              await getDistricts(
                filters,
              );
            break;

          case "sectors":
            response =
              await getSectors(
                filters,
              );
            break;

          case "cells":
            response =
              await getCells(
                filters,
              );
            break;

          case "villages":
            response =
              await getVillages(
                filters,
              );
            break;

          case "collection-points":
            response =
              await getCollectionPoints(
                filters,
              );
            break;
        }

        setRows(
          response.items,
        );

        setLastPage(
          response.pagination
            .last_page,
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load locations.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      page,
      search,
      status,
      tab,
    ]);

  useEffect(() => {
    const timer =
      window.setTimeout(
        load,
        250,
      );

    return () =>
      window.clearTimeout(
        timer,
      );
  }, [load]);

  async function toggleStatus(
    row: Row,
  ) {
    try {
      await updateLocationStatus(
        tab,
        row.id,
        !row.is_active,
      );

      await load();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update status.",
      );
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <MapPinned
            size={21}
            className="text-[#0a5038]"
          />

          <h2 className="text-lg font-bold text-slate-950">
            Rwanda Locations
          </h2>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Province → District →
          Sector → Cell → Village →
          Collection Point
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#e8dfd2] bg-white p-2">
        <div className="flex min-w-max gap-1">
          {tabs.map(
            (item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setTab(
                    item.key,
                  );
                  setPage(1);
                }}
                className={[
                  "rounded-lg px-4 py-2 text-xs font-semibold transition",
                  tab ===
                  item.key
                    ? "bg-[#0a5038] text-white"
                    : "text-slate-600 hover:bg-[#f7f0e6]",
                ].join(
                  " ",
                )}
              >
                {
                  item.label
                }
              </button>
            ),
          )}
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-[#e8dfd2] bg-white p-4 md:grid-cols-[1fr_180px]">
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(
              event,
            ) => {
              setSearch(
                event.target
                  .value,
              );
              setPage(1);
            }}
            placeholder="Search location..."
            className="h-10 w-full rounded-lg border border-[#ddd4c8] pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-[#0a5038]"
          />
        </div>

        <select
          value={status}
          onChange={(
            event,
          ) => {
            setStatus(
              event.target
                .value,
            );
            setPage(1);
          }}
          className="h-10 rounded-lg border border-[#ddd4c8] bg-white px-3 text-sm text-slate-800"
        >
          <option value="">
            All statuses
          </option>

          <option value="active">
            Active
          </option>

          <option value="inactive">
            Inactive
          </option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[#e8dfd2] bg-white">
        {loading ? (
          <div className="flex min-h-[340px] items-center justify-center">
            <LoaderCircle
              size={27}
              className="animate-spin text-[#0a5038]"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-[#faf5ed] text-xs text-slate-600">
                <tr>
                  <th className="px-4 py-3">
                    Name
                  </th>

                  {tab ===
                    "collection-points" && (
                    <th className="px-4 py-3">
                      Code
                    </th>
                  )}

                  <th className="px-4 py-3">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map(
                  (row) => (
                    <tr
                      key={
                        row.id
                      }
                      className="border-t border-slate-100"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {
                          row.name
                        }
                      </td>

                      {tab ===
                        "collection-points" && (
                        <td className="px-4 py-3 text-slate-600">
                          {row.code ??
                            "—"}
                        </td>
                      )}

                      <td className="px-4 py-3">
                        <span
                          className={[
                            "rounded-full px-2.5 py-1 text-xs font-semibold",
                            row.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600",
                          ].join(
                            " ",
                          )}
                        >
                          {row.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            toggleStatus(
                              row,
                            )
                          }
                          className="rounded-lg border border-[#ddd4c8] px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-[#faf5ed]"
                        >
                          {row.is_active
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ),
                )}

                {!rows.length && (
                  <tr>
                    <td
                      colSpan={
                        tab ===
                        "collection-points"
                          ? 4
                          : 3
                      }
                      className="px-4 py-14 text-center text-sm text-slate-500"
                    >
                      No locations
                      found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-100 p-3">
          <button
            type="button"
            disabled={
              page <= 1
            }
            onClick={() =>
              setPage(
                (current) =>
                  Math.max(
                    1,
                    current - 1,
                  ),
              )
            }
            className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40"
          >
            Previous
          </button>

          <button
            type="button"
            disabled={
              page >=
              lastPage
            }
            onClick={() =>
              setPage(
                (current) =>
                  current + 1,
              )
            }
            className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
