"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  LoaderCircle,
  RotateCcw,
  Search,
  Wallet,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getAgentWallet,
  getAgentWallets,
  getAgentWalletSummary,
  getAgentWalletTransactions,
} from "@/services/agent-wallet-service";

import {
  getActiveCoffeeSeasonForAllocation,
} from "@/services/cash-allocation-service";

import type {
  AgentWalletDetail,
  AgentWalletFinanceSummary,
  AgentWalletItem,
  AgentWalletTransaction,
} from "@/types/agent-wallet";

import type {
  ActiveCoffeeSeason,
} from "@/types/cash-allocation";

const emptySummary: AgentWalletFinanceSummary = {
  total_allocated: "0.00",
  total_reversed: "0.00",
  total_spent: "0.00",
  available_balance: "0.00",
  agents_with_activity: 0,
  currency: "RWF",
};

export default function AgentWalletManagement() {
  const [wallets, setWallets] =
    useState<AgentWalletItem[]>([]);

  const [summary, setSummary] =
    useState<AgentWalletFinanceSummary>(
      emptySummary,
    );

  const [season, setSeason] =
    useState<ActiveCoffeeSeason | null>(
      null,
    );

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [appliedSearch, setAppliedSearch] =
    useState("");

  const [appliedStatus, setAppliedStatus] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [lastPage, setLastPage] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [viewOpen, setViewOpen] =
    useState(false);

  const [walletDetail, setWalletDetail] =
    useState<AgentWalletDetail | null>(
      null,
    );

  const [transactions, setTransactions] =
    useState<AgentWalletTransaction[]>(
      [],
    );

  const [detailLoading, setDetailLoading] =
    useState(false);

  useEffect(() => {
    async function loadSeason() {
      try {
        const activeSeason =
          await getActiveCoffeeSeasonForAllocation();

        setSeason(activeSeason);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load active coffee season.",
        );
      }
    }

    void loadSeason();
  }, []);

  const loadData =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const [
          walletResult,
          summaryResult,
        ] = await Promise.all([
          getAgentWallets({
            search:
              appliedSearch ||
              undefined,

            status:
              appliedStatus ||
              undefined,

            coffee_season_id:
              season?.id,

            page,
            per_page: 15,
          }),

          getAgentWalletSummary(
            season?.id,
          ),
        ]);

        setWallets(
          walletResult.items,
        );

        setSummary(
          summaryResult,
        );

        setTotal(
          walletResult.pagination.total,
        );

        setLastPage(
          Math.max(
            1,
            walletResult.pagination.last_page,
          ),
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load agent wallets.",
        );
      } finally {
        setLoading(false);
      }
    }, [
      appliedSearch,
      appliedStatus,
      page,
      season?.id,
    ]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function applyFilters() {
    setAppliedSearch(
      search.trim(),
    );

    setAppliedStatus(
      status,
    );

    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setStatus("");

    setAppliedSearch("");
    setAppliedStatus("");

    setPage(1);
  }

  async function openWallet(
    wallet: AgentWalletItem,
  ) {
    setViewOpen(true);
    setDetailLoading(true);
    setWalletDetail({
      agent: wallet.agent,
      summary: wallet.summary,
    });

    setTransactions([]);

    try {
      const [
        detail,
        history,
      ] = await Promise.all([
        getAgentWallet(
          wallet.agent.id,
          season?.id,
        ),

        getAgentWalletTransactions(
          wallet.agent.id,
          {
            coffee_season_id:
              season?.id,

            per_page: 20,
          },
        ),
      ]);

      setWalletDetail(detail);
      setTransactions(
        history.items,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load wallet details.",
      );
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">
          Agent Cash Wallets
        </h1>

        <p className="mt-1 text-sm font-medium text-slate-600">
          Track cash allocated, spent and remaining for each field agent.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-[#e5ded4] bg-[#fffaf2] px-4 py-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#91651e]">
            Coffee Season
          </p>

          <p className="mt-1 font-bold text-slate-950">
            {season
              ? `${season.name} · ${season.code}`
              : "All wallet activity"}
          </p>
        </div>

        {season && (
          <span className="rounded-md bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
            Active
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 border-y border-slate-200 md:grid-cols-3 xl:grid-cols-5">
        <Metric
          label="Total Allocated"
          value={formatMoney(
            summary.total_allocated,
          )}
        />

        <Metric
          label="Reversed"
          value={formatMoney(
            summary.total_reversed,
          )}
        />

        <Metric
          label="Spent"
          value={formatMoney(
            summary.total_spent,
          )}
        />

        <Metric
          label="Available Balance"
          value={formatMoney(
            summary.available_balance,
          )}
          strong
        />

        <Metric
          label="Agents With Activity"
          value={String(
            summary.agents_with_activity,
          )}
        />
      </div>

      <section className="border-y border-slate-200 bg-white py-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-bold text-slate-800">
              Search
            </label>

            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value,
                  )
                }
                placeholder="Agent code, name, phone..."
                className="h-11 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm text-slate-950 outline-none focus:border-[#075b38]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-slate-800">
              Agent Status
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value,
                )
              }
              className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950"
            >
              <option value="">
                All Agents
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={applyFilters}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#075b38] px-4 text-sm font-bold text-white"
            >
              <Filter size={16} />
              Filter
            </button>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-400 bg-white px-4 text-sm font-bold text-slate-900 hover:bg-slate-100"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {error}
        </div>
      )}

      <section className="overflow-hidden border-y border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px]">
            <thead className="bg-[#fcfbf9]">
              <tr className="border-b border-slate-200 text-left text-xs font-bold uppercase tracking-wide text-slate-700">
                <th className="px-4 py-4">
                  Agent
                </th>

                <th className="px-4 py-4">
                  Total Allocated
                </th>

                <th className="px-4 py-4">
                  Reversed
                </th>

                <th className="px-4 py-4">
                  Spent
                </th>

                <th className="px-4 py-4">
                  Available Balance
                </th>

                <th className="px-4 py-4">
                  Status
                </th>

                <th className="px-4 py-4 text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-20"
                  >
                    <LoaderCircle
                      size={30}
                      className="mx-auto animate-spin text-[#075b38]"
                    />
                  </td>
                </tr>
              ) : wallets.length ? (
                wallets.map(
                  (wallet) => (
                    <tr
                      key={
                        wallet.agent.id
                      }
                      className="border-b border-slate-100 text-sm hover:bg-[#fdfbf8]"
                    >
                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-950">
                          {
                            wallet.agent
                              .user
                              ?.name ??
                            "—"
                          }
                        </p>

                        <p className="mt-1 text-xs font-semibold text-[#80570f]">
                          {
                            wallet.agent
                              .agent_code
                          }
                        </p>
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-800">
                        {formatMoney(
                          wallet.summary
                            .total_allocated,
                        )}
                      </td>

                      <td className="px-4 py-4 text-red-700">
                        {formatMoney(
                          wallet.summary
                            .total_reversed,
                        )}
                      </td>

                      <td className="px-4 py-4 text-slate-800">
                        {formatMoney(
                          wallet.summary
                            .total_spent,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-extrabold text-[#075b38]">
                          {formatMoney(
                            wallet.summary
                              .balance,
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={
                            wallet.agent
                              .status ===
                            "active"
                              ? "font-bold text-emerald-700"
                              : "font-bold text-slate-500"
                          }
                        >
                          {
                            wallet.agent
                              .status
                          }
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            void openWallet(
                              wallet,
                            )
                          }
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-400 px-3 text-xs font-bold text-slate-900 hover:bg-slate-100"
                        >
                          <Eye size={15} />
                          View Wallet
                        </button>
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-sm text-slate-600"
                  >
                    No agent wallet activity found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-4">
          <p className="text-sm text-slate-600">
            {total} agents · Page{" "}
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
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 disabled:opacity-40"
            >
              <ChevronLeft size={17} />
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
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {viewOpen &&
        walletDetail && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f6e7d2] text-[#075b38]">
                    <Wallet size={20} />
                  </div>

                  <div>
                    <h2 className="text-xl font-extrabold text-slate-950">
                      {
                        walletDetail.agent
                          .user
                          ?.name ??
                        "Agent Wallet"
                      }
                    </h2>

                    <p className="mt-1 text-sm font-semibold text-slate-600">
                      {
                        walletDetail.agent
                          .agent_code
                      }
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setViewOpen(false)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-400 text-slate-900 hover:bg-slate-100"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="max-h-[calc(90vh-76px)] overflow-y-auto">
                <div className="grid grid-cols-2 border-b border-slate-200 md:grid-cols-4">
                  <Metric
                    label="Allocated"
                    value={formatMoney(
                      walletDetail
                        .summary
                        .total_allocated,
                    )}
                  />

                  <Metric
                    label="Reversed"
                    value={formatMoney(
                      walletDetail
                        .summary
                        .total_reversed,
                    )}
                  />

                  <Metric
                    label="Spent"
                    value={formatMoney(
                      walletDetail
                        .summary
                        .total_spent,
                    )}
                  />

                  <Metric
                    label="Balance"
                    value={formatMoney(
                      walletDetail
                        .summary
                        .balance,
                    )}
                    strong
                  />
                </div>

                <div className="px-6 py-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-950">
                      Wallet Transactions
                    </h3>

                    <span className="text-xs font-semibold text-slate-500">
                      Most recent 20
                    </span>
                  </div>

                  {detailLoading ? (
                    <div className="py-16">
                      <LoaderCircle
                        size={28}
                        className="mx-auto animate-spin text-[#075b38]"
                      />
                    </div>
                  ) : transactions.length ? (
                    <div className="overflow-x-auto border-y border-slate-200">
                      <table className="w-full min-w-[750px]">
                        <thead className="bg-[#fcfbf9]">
                          <tr className="text-left text-xs font-bold uppercase text-slate-700">
                            <th className="px-3 py-3">
                              Transaction
                            </th>

                            <th className="px-3 py-3">
                              Description
                            </th>

                            <th className="px-3 py-3">
                              Date
                            </th>

                            <th className="px-3 py-3">
                              Amount
                            </th>

                            <th className="px-3 py-3">
                              By
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {transactions.map(
                            (transaction) => (
                              <tr
                                key={
                                  transaction.id
                                }
                                className="border-t border-slate-100 text-sm"
                              >
                                <td className="px-3 py-3">
                                  <div className="flex items-center gap-2">
                                    {transaction.direction ===
                                    "credit" ? (
                                      <ArrowDownLeft
                                        size={17}
                                        className="text-emerald-700"
                                      />
                                    ) : (
                                      <ArrowUpRight
                                        size={17}
                                        className="text-red-700"
                                      />
                                    )}

                                    <span className="font-bold text-slate-900">
                                      {
                                        transaction.transaction_code
                                      }
                                    </span>
                                  </div>
                                </td>

                                <td className="px-3 py-3 text-slate-700">
                                  {transaction.description ??
                                    formatTransactionType(
                                      transaction.type,
                                    )}
                                </td>

                                <td className="px-3 py-3 text-slate-700">
                                  {formatDate(
                                    transaction.created_at,
                                  )}
                                </td>

                                <td
                                  className={
                                    transaction.direction ===
                                    "credit"
                                      ? "px-3 py-3 font-bold text-emerald-700"
                                      : "px-3 py-3 font-bold text-red-700"
                                  }
                                >
                                  {transaction.direction ===
                                  "credit"
                                    ? "+"
                                    : "-"}
                                  {formatMoney(
                                    transaction.amount,
                                  )}
                                </td>

                                <td className="px-3 py-3 text-slate-700">
                                  {
                                    transaction
                                      .created_by
                                      ?.name ??
                                    "System"
                                  }
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="py-12 text-center text-sm text-slate-600">
                      No wallet transactions found.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

function Metric({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="border-r border-slate-200 px-4 py-4 last:border-r-0">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
        {label}
      </p>

      <p
        className={[
          "mt-1 text-lg font-extrabold",
          strong
            ? "text-[#075b38]"
            : "text-slate-950",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function formatMoney(
  value: string | number,
) {
  const amount = Number(value);

  return `${new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 0,
    },
  ).format(
    Number.isFinite(amount)
      ? amount
      : 0,
  )} RWF`;
}

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(
    new Date(value),
  );
}

function formatTransactionType(
  type: string,
) {
  return type
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}
