"use client";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Banknote,
  Eye,
  LoaderCircle,
  Plus,
  ReceiptText,
  RotateCcw,
  Search,
  WalletCards,
  X,
} from "lucide-react";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createPettyCashTransaction,
  getPettyCashRole,
  getPettyCashSummary,
  getPettyCashTransaction,
  getPettyCashTransactions,
  reversePettyCashTransaction,
} from "@/services/petty-cash-service";

import type {
  DashboardRole,
  PettyCashStatus,
  PettyCashSummary,
  PettyCashTransaction,
  PettyCashTransactionType,
} from "@/types/petty-cash";

const inputClass =
  "h-11 w-full rounded-lg border border-slate-400 bg-white px-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-600 focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

const textareaClass =
  "min-h-24 w-full rounded-lg border border-slate-400 bg-white px-3 py-2.5 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-600 focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

const expenseCategories = [
  "Fuel",
  "Vehicle Maintenance",
  "Electricity",
  "Water",
  "Transport",
  "Equipment Repair",
  "Processing Materials",
  "Packaging",
  "Communication",
  "Office Supplies",
  "Food & Refreshments",
  "Casual Labour",
  "Bank Charges",
  "Cleaning",
  "Security",
  "Other",
];

const emptySummary: PettyCashSummary = {
  current_balance: "0.00",
  total_funded: "0.00",
  total_spent: "0.00",
  today_spent: "0.00",
  this_month_spent: "0.00",

  funding_transactions: 0,
  expense_transactions: 0,
  reversal_transactions: 0,

  currency: "RWF",
};

type PostableType =
  | "fund_in"
  | "expense";

export default function PettyCashManagement() {
  const [items, setItems] =
    useState<PettyCashTransaction[]>([]);

  const [summary, setSummary] =
    useState<PettyCashSummary>(
      emptySummary,
    );

  const [role, setRole] =
    useState<DashboardRole>("");

  const [search, setSearch] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("");

  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");

  const [filters, setFilters] =
    useState({
      search: "",
      type: "",
      status: "",
      category: "",
      dateFrom: "",
      dateTo: "",
    });

  const [page, setPage] =
    useState(1);

  const [lastPage, setLastPage] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [createOpen, setCreateOpen] =
    useState(false);

  const [viewing, setViewing] =
    useState<PettyCashTransaction | null>(
      null,
    );

  const [
    reverseTarget,
    setReverseTarget,
  ] =
    useState<PettyCashTransaction | null>(
      null,
    );

  const [formType, setFormType] =
    useState<PostableType>("expense");

  const [
    transactionDate,
    setTransactionDate,
  ] = useState("");

  const [amount, setAmount] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [
    counterpartyName,
    setCounterpartyName,
  ] = useState("");

  const [purpose, setPurpose] =
    useState("");

  const [
    referenceNumber,
    setReferenceNumber,
  ] = useState("");

  const [
    receiptNumber,
    setReceiptNumber,
  ] = useState("");

  const [notes, setNotes] =
    useState("");

  const [
    reversalReason,
    setReversalReason,
  ] = useState("");

  const canManage =
    role === "admin" ||
    role === "accountant";

  const availableBalance =
    Number(
      summary.current_balance,
    );

  const enteredAmount =
    Number(amount);

  const expectedBalance =
    useMemo(() => {
      if (
        !Number.isFinite(
          enteredAmount,
        ) ||
        enteredAmount <= 0
      ) {
        return null;
      }

      if (
        formType === "fund_in"
      ) {
        return (
          availableBalance +
          enteredAmount
        );
      }

      return (
        availableBalance -
        enteredAmount
      );
    }, [
      availableBalance,
      enteredAmount,
      formType,
    ]);

  const load = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const [list, totals] =
          await Promise.all([
            getPettyCashTransactions({
              search:
                filters.search ||
                undefined,

              transaction_type:
                filters.type
                  ? (
                      filters.type as PettyCashTransactionType
                    )
                  : undefined,

              status:
                filters.status
                  ? (
                      filters.status as PettyCashStatus
                    )
                  : undefined,

              category:
                filters.category ||
                undefined,

              date_from:
                filters.dateFrom ||
                undefined,

              date_to:
                filters.dateTo ||
                undefined,

              page,
              per_page: 15,
            }),

            getPettyCashSummary(),
          ]);

        setItems(list.items);
        setSummary(totals);

        setTotal(
          list.pagination.total,
        );

        setLastPage(
          Math.max(
            list.pagination
              .last_page,
            1,
          ),
        );
      } catch (error) {
        setError(
          errorMessage(error),
        );
      } finally {
        setLoading(false);
      }
    },
    [
      filters,
      page,
    ],
  );

  useEffect(() => {
    async function prepare() {
      try {
        setRole(
          await getPettyCashRole(),
        );
      } catch (error) {
        setError(
          errorMessage(error),
        );
      }
    }

    void prepare();
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function applyFilters() {
    setFilters({
      search:
        search.trim(),

      type:
        typeFilter,

      status:
        statusFilter,

      category:
        categoryFilter,

      dateFrom,

      dateTo,
    });

    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setTypeFilter("");
    setStatusFilter("");
    setCategoryFilter("");
    setDateFrom("");
    setDateTo("");

    setFilters({
      search: "",
      type: "",
      status: "",
      category: "",
      dateFrom: "",
      dateTo: "",
    });

    setPage(1);
  }

  function resetForm(
    type: PostableType,
  ) {
    setFormType(type);
    setTransactionDate(
      todayInput(),
    );

    setAmount("");
    setCategory("");
    setCounterpartyName("");
    setPurpose("");
    setReferenceNumber("");
    setReceiptNumber("");
    setNotes("");
  }

  function openCreate(
    type: PostableType,
  ) {
    setError("");
    setSuccess("");

    resetForm(type);

    setCreateOpen(true);
  }

  function validateForm() {
    if (!transactionDate) {
      setError(
        "Transaction date is required.",
      );
      return false;
    }

    const value =
      Number(amount);

    if (
      !Number.isFinite(value) ||
      value <= 0
    ) {
      setError(
        "Amount must be greater than zero.",
      );
      return false;
    }

    if (
      formType === "expense" &&
      value > availableBalance
    ) {
      setError(
        "Petty Cash amount exceeds the available balance.",
      );
      return false;
    }

    if (
      formType === "expense" &&
      category.trim().length < 2
    ) {
      setError(
        "Expense category is required.",
      );
      return false;
    }

    if (
      counterpartyName
        .trim()
        .length < 2
    ) {
      setError(
        formType === "fund_in"
          ? "Funding source is required."
          : "Payee name is required.",
      );
      return false;
    }

    if (
      purpose.trim().length < 3
    ) {
      setError(
        "Purpose is required.",
      );
      return false;
    }

    return true;
  }

  async function submitCreate() {
    if (!validateForm()) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const transaction =
        await createPettyCashTransaction({
          transaction_date:
            transactionDate,

          transaction_type:
            formType,

          amount:
            Number(amount),

          category:
            formType === "expense"
              ? category.trim()
              : undefined,

          counterparty_name:
            counterpartyName.trim(),

          purpose:
            purpose.trim(),

          reference_number:
            referenceNumber.trim() ||
            undefined,

          receipt_number:
            receiptNumber.trim() ||
            undefined,

          notes:
            notes.trim() ||
            undefined,
        });

      setCreateOpen(false);

      if (
        transaction.transaction_type ===
        "expense"
      ) {
        setSuccess(
          transaction.expense
            ? `${transaction.transaction_code} posted and Expense ${transaction.expense.expense_code} created automatically.`
            : `${transaction.transaction_code} posted successfully.`,
        );
      } else {
        setSuccess(
          `${transaction.transaction_code} funding posted successfully.`,
        );
      }

      await load();
    } catch (error) {
      setError(
        errorMessage(error),
      );
    } finally {
      setBusy(false);
    }
  }

  async function openView(
    transaction: PettyCashTransaction,
  ) {
    try {
      setViewing(
        await getPettyCashTransaction(
          transaction.id,
        ),
      );
    } catch (error) {
      setError(
        errorMessage(error),
      );
    }
  }

  async function submitReverse() {
    if (!reverseTarget) {
      return;
    }

    if (
      reversalReason
        .trim()
        .length < 3
    ) {
      setError(
        "Reversal reason is required.",
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      const result =
        await reversePettyCashTransaction(
          reverseTarget.id,
          reversalReason.trim(),
        );

      setReverseTarget(null);
      setReversalReason("");

      setSuccess(
        `${reverseTarget.transaction_code} reversed successfully. ${result.transaction_code} was created.`,
      );

      await load();
    } catch (error) {
      setError(
        errorMessage(error),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5 text-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">
            Petty Cash
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-700">
            Manage small operational
            cash while keeping a
            complete balance and
            transaction history.
          </p>
        </div>

        {canManage && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                openCreate(
                  "fund_in",
                )
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#075b38] bg-white px-5 text-sm font-bold text-[#075b38] hover:bg-emerald-50"
            >
              <ArrowDownToLine
                size={17}
              />
              Add Funding
            </button>

            <button
              type="button"
              onClick={() =>
                openCreate(
                  "expense",
                )
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white hover:bg-[#064a2f]"
            >
              <Plus size={17} />
              Record Expense
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Current Balance"
          value={formatMoney(
            summary.current_balance,
            summary.currency,
          )}
          icon={
            <WalletCards
              size={19}
            />
          }
          green
        />

        <Metric
          title="Total Funded"
          value={formatMoney(
            summary.total_funded,
            summary.currency,
          )}
          icon={
            <ArrowDownToLine
              size={19}
            />
          }
        />

        <Metric
          title="Total Spent"
          value={formatMoney(
            summary.total_spent,
            summary.currency,
          )}
          icon={
            <ArrowUpFromLine
              size={19}
            />
          }
        />

        <Metric
          title="Today Spent"
          value={formatMoney(
            summary.today_spent,
            summary.currency,
          )}
          icon={
            <Banknote
              size={19}
            />
          }
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <MiniMetric
          title="This Month"
          value={formatMoney(
            summary.this_month_spent,
            summary.currency,
          )}
        />

        <MiniMetric
          title="Funding Transactions"
          value={String(
            summary.funding_transactions,
          )}
        />

        <MiniMetric
          title="Expense Transactions"
          value={String(
            summary.expense_transactions,
          )}
        />

        <MiniMetric
          title="Reversals"
          value={String(
            summary.reversal_transactions,
          )}
        />
      </div>

      <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1fr_170px_160px_180px_150px_150px_auto_auto]">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              onKeyDown={(
                event,
              ) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  applyFilters();
                }
              }}
              placeholder="Search transaction, payee, purpose or reference..."
              className="h-11 w-full rounded-lg border border-slate-400 bg-white pl-9 pr-3 text-sm font-medium outline-none placeholder:text-slate-600 focus:border-[#075b38]"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value,
              )
            }
            className={inputClass}
          >
            <option value="">
              All Types
            </option>

            <option value="fund_in">
              Funding
            </option>

            <option value="expense">
              Expense
            </option>

            <option value="reversal">
              Reversal
            </option>
          </select>

          <select
            value={
              statusFilter
            }
            onChange={(event) =>
              setStatusFilter(
                event.target.value,
              )
            }
            className={inputClass}
          >
            <option value="">
              All Statuses
            </option>

            <option value="posted">
              Posted
            </option>

            <option value="reversed">
              Reversed
            </option>
          </select>

          <select
            value={
              categoryFilter
            }
            onChange={(event) =>
              setCategoryFilter(
                event.target.value,
              )
            }
            className={inputClass}
          >
            <option value="">
              All Categories
            </option>

            {expenseCategories.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ),
            )}
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(event) =>
              setDateFrom(
                event.target.value,
              )
            }
            className={inputClass}
          />

          <input
            type="date"
            value={dateTo}
            onChange={(event) =>
              setDateTo(
                event.target.value,
              )
            }
            className={inputClass}
          />

          <button
            type="button"
            onClick={
              applyFilters
            }
            className="h-11 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white"
          >
            Filter
          </button>

          <button
            type="button"
            onClick={
              resetFilters
            }
            className="h-11 rounded-lg border border-slate-400 bg-white px-5 text-sm font-bold hover:bg-slate-100"
          >
            Reset
          </button>
        </div>
      </div>

      {error && (
        <Notice
          text={error}
          error
        />
      )}

      {success && (
        <Notice
          text={success}
        />
      )}

      <section className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1500px]">
            <thead className="bg-[#f6f1e8]">
              <tr className="border-b border-slate-300 text-left text-xs font-extrabold uppercase text-slate-800">
                <th className="px-4 py-4">
                  Transaction
                </th>

                <th className="px-4 py-4">
                  Date
                </th>

                <th className="px-4 py-4">
                  Type
                </th>

                <th className="px-4 py-4">
                  Counterparty
                </th>

                <th className="px-4 py-4">
                  Purpose
                </th>

                <th className="px-4 py-4">
                  Amount
                </th>

                <th className="px-4 py-4">
                  Before
                </th>

                <th className="px-4 py-4">
                  After
                </th>

                <th className="px-4 py-4">
                  Expense
                </th>

                <th className="px-4 py-4">
                  Status
                </th>

                <th className="px-4 py-4 text-center">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={11}
                    className="py-20"
                  >
                    <LoaderCircle
                      size={30}
                      className="mx-auto animate-spin text-[#075b38]"
                    />
                  </td>
                </tr>
              ) : items.length ? (
                items.map(
                  (transaction) => (
                    <tr
                      key={
                        transaction.id
                      }
                      className="border-b border-slate-200 text-sm hover:bg-[#fffdf8]"
                    >
                      <td className="px-4 py-4">
                        <p className="font-extrabold text-[#80570f]">
                          {
                            transaction.transaction_code
                          }
                        </p>

                        {transaction.category && (
                          <p className="mt-1 text-xs text-slate-600">
                            {
                              transaction.category
                            }
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4 font-semibold">
                        {
                          transaction.transaction_date
                        }
                      </td>

                      <td className="px-4 py-4">
                        <TypeBadge
                          type={
                            transaction.transaction_type
                          }
                        />
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {
                          transaction.counterparty_name
                        }
                      </td>

                      <td className="max-w-[230px] px-4 py-4">
                        <p className="truncate font-medium">
                          {
                            transaction.purpose
                          }
                        </p>
                      </td>

                      <td className="px-4 py-4 font-extrabold">
                        <span
                          className={
                            transaction.transaction_type ===
                            "fund_in"
                              ? "text-emerald-700"
                              : transaction.transaction_type ===
                                  "expense"
                                ? "text-red-700"
                                : "text-slate-900"
                          }
                        >
                          {transaction.transaction_type ===
                          "fund_in"
                            ? "+"
                            : transaction.transaction_type ===
                                "expense"
                              ? "-"
                              : ""}
                          {formatMoney(
                            transaction.amount,
                            transaction.currency,
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-4 font-semibold">
                        {formatMoney(
                          transaction.balance_before,
                          transaction.currency,
                        )}
                      </td>

                      <td className="px-4 py-4 font-extrabold text-[#075b38]">
                        {formatMoney(
                          transaction.balance_after,
                          transaction.currency,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {transaction.expense ? (
                          <span className="font-extrabold text-[#075b38]">
                            {
                              transaction.expense
                                .expense_code
                            }
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          status={
                            transaction.status
                          }
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-2">
                          <IconButton
                            title="View"
                            onClick={() =>
                              void openView(
                                transaction,
                              )
                            }
                          >
                            <Eye size={15} />
                          </IconButton>

                          {canManage &&
                            transaction.status ===
                              "posted" &&
                            transaction.transaction_type !==
                              "reversal" && (
                              <IconButton
                                title="Reverse"
                                onClick={() => {
                                  setReverseTarget(
                                    transaction,
                                  );

                                  setReversalReason(
                                    "",
                                  );
                                }}
                              >
                                <RotateCcw
                                  size={
                                    15
                                  }
                                />
                              </IconButton>
                            )}
                        </div>
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td
                    colSpan={11}
                    className="py-16 text-center"
                  >
                    <WalletCards
                      size={40}
                      className="mx-auto text-slate-400"
                    />

                    <p className="mt-3 font-bold">
                      No Petty Cash
                      transactions found.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          lastPage={lastPage}
          total={total}
          setPage={setPage}
        />
      </section>

      {createOpen && (
        <Modal>
          <ModalCard
            title={
              formType ===
              "fund_in"
                ? "Add Petty Cash Funding"
                : "Record Petty Cash Expense"
            }
            subtitle={
              formType ===
              "fund_in"
                ? "Funding increases the Petty Cash balance."
                : "The Expense will reduce Petty Cash and automatically create a recorded Expense."
            }
            close={() =>
              setCreateOpen(
                false,
              )
            }
          >
            <div className="grid gap-3 rounded-lg border border-[#d9c9ae] bg-[#fffaf2] p-4 sm:grid-cols-3">
              <Info
                title="Current Balance"
                value={formatMoney(
                  summary.current_balance,
                  summary.currency,
                )}
              />

              <Info
                title={
                  formType ===
                  "fund_in"
                    ? "Funding"
                    : "Expense"
                }
                value={
                  enteredAmount > 0
                    ? formatMoney(
                        enteredAmount,
                        summary.currency,
                      )
                    : "—"
                }
              />

              <Info
                title="Expected Balance"
                value={
                  expectedBalance !==
                    null
                    ? formatMoney(
                        expectedBalance,
                        summary.currency,
                      )
                    : "—"
                }
              />
            </div>

            {formType ===
              "expense" &&
              expectedBalance !==
                null &&
              expectedBalance < 0 && (
                <Notice
                  error
                  text="This Expense exceeds the current Petty Cash balance."
                />
              )}

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Transaction Date">
                <input
                  type="date"
                  max={todayInput()}
                  value={
                    transactionDate
                  }
                  onChange={(event) =>
                    setTransactionDate(
                      event.target.value,
                    )
                  }
                  className={
                    inputClass
                  }
                />
              </Field>

              <Field label="Amount (RWF)">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(event) =>
                    setAmount(
                      event.target.value,
                    )
                  }
                  placeholder="0"
                  className={
                    inputClass
                  }
                />
              </Field>
            </div>

            {formType ===
              "expense" && (
              <Field label="Expense Category">
                <input
                  list="petty-cash-categories"
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target.value,
                    )
                  }
                  placeholder="Example: Fuel"
                  className={
                    inputClass
                  }
                />

                <datalist id="petty-cash-categories">
                  {expenseCategories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      />
                    ),
                  )}
                </datalist>
              </Field>
            )}

            <Field
              label={
                formType ===
                "fund_in"
                  ? "Funding Source"
                  : "Payee / Recipient"
              }
            >
              <input
                value={
                  counterpartyName
                }
                onChange={(event) =>
                  setCounterpartyName(
                    event.target.value,
                  )
                }
                placeholder={
                  formType ===
                  "fund_in"
                    ? "Who provided the Petty Cash?"
                    : "Who received the payment?"
                }
                className={
                  inputClass
                }
              />
            </Field>

            <Field label="Purpose">
              <textarea
                value={purpose}
                onChange={(event) =>
                  setPurpose(
                    event.target.value,
                  )
                }
                placeholder={
                  formType ===
                  "fund_in"
                    ? "Example: Weekly Petty Cash funding"
                    : "Explain what the payment was for..."
                }
                className={
                  textareaClass
                }
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Reference Number">
                <input
                  value={
                    referenceNumber
                  }
                  onChange={(event) =>
                    setReferenceNumber(
                      event.target.value,
                    )
                  }
                  placeholder="Optional reference"
                  className={
                    inputClass
                  }
                />
              </Field>

              <Field label="Receipt Number">
                <input
                  value={
                    receiptNumber
                  }
                  onChange={(event) =>
                    setReceiptNumber(
                      event.target.value,
                    )
                  }
                  placeholder="Optional receipt"
                  className={
                    inputClass
                  }
                />
              </Field>
            </div>

            {formType ===
              "expense" && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-bold text-emerald-950">
                  An Expense record
                  will be created
                  automatically.
                </p>

                <p className="mt-1 text-xs font-medium text-emerald-800">
                  Do not enter this
                  payment again in the
                  Expenses module.
                </p>
              </div>
            )}

            <Field label="Notes">
              <textarea
                value={notes}
                onChange={(event) =>
                  setNotes(
                    event.target.value,
                  )
                }
                placeholder="Optional notes..."
                className={
                  textareaClass
                }
              />
            </Field>

            <Actions
              busy={busy}
              cancel={() =>
                setCreateOpen(
                  false,
                )
              }
              submit={() =>
                void submitCreate()
              }
              text={
                formType ===
                "fund_in"
                  ? "Post Funding"
                  : "Post Expense"
              }
            />
          </ModalCard>
        </Modal>
      )}

      {reverseTarget && (
        <Modal>
          <ModalCard
            title={`Reverse ${reverseTarget.transaction_code}`}
            subtitle="The original transaction stays in the ledger and a new reversal transaction is created."
            close={() =>
              setReverseTarget(
                null,
              )
            }
          >
            <div className="grid gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 sm:grid-cols-3">
              <Info
                title="Type"
                value={label(
                  reverseTarget.transaction_type,
                )}
              />

              <Info
                title="Amount"
                value={formatMoney(
                  reverseTarget.amount,
                  reverseTarget.currency,
                )}
              />

              <Info
                title="Current Balance"
                value={formatMoney(
                  summary.current_balance,
                  summary.currency,
                )}
              />
            </div>

            {reverseTarget.expense && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-bold text-red-900">
                  Linked Expense:{" "}
                  {
                    reverseTarget.expense
                      .expense_code
                  }
                </p>

                <p className="mt-1 text-xs font-medium text-red-800">
                  Reversing this Petty
                  Cash Expense will also
                  cancel its linked
                  Expense record.
                </p>
              </div>
            )}

            <Field label="Reversal Reason">
              <textarea
                value={
                  reversalReason
                }
                onChange={(event) =>
                  setReversalReason(
                    event.target.value,
                  )
                }
                placeholder="Explain why this transaction must be reversed..."
                className={
                  textareaClass
                }
              />
            </Field>

            <div className="flex justify-end gap-2 border-t border-slate-300 pt-4">
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  setReverseTarget(
                    null,
                  )
                }
                className="h-10 rounded-lg border border-slate-400 px-4 text-sm font-bold"
              >
                Keep Transaction
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void submitReverse()
                }
                className="h-10 rounded-lg bg-red-700 px-5 text-sm font-bold text-white disabled:opacity-50"
              >
                {busy
                  ? "Reversing..."
                  : "Reverse Transaction"}
              </button>
            </div>
          </ModalCard>
        </Modal>
      )}

      {viewing && (
        <Modal>
          <ModalCard
            title={
              viewing.transaction_code
            }
            subtitle="Petty Cash transaction and financial traceability."
            close={() =>
              setViewing(null)
            }
          >
            <div className="grid gap-x-6 md:grid-cols-3">
              <Detail
                title="Status"
                value={label(
                  viewing.status,
                )}
              />

              <Detail
                title="Type"
                value={label(
                  viewing.transaction_type,
                )}
              />

              <Detail
                title="Date"
                value={
                  viewing.transaction_date
                }
              />

              <Detail
                title="Amount"
                value={formatMoney(
                  viewing.amount,
                  viewing.currency,
                )}
              />

              <Detail
                title="Balance Before"
                value={formatMoney(
                  viewing.balance_before,
                  viewing.currency,
                )}
              />

              <Detail
                title="Balance After"
                value={formatMoney(
                  viewing.balance_after,
                  viewing.currency,
                )}
              />

              <Detail
                title="Category"
                value={
                  viewing.category ??
                  "—"
                }
              />

              <Detail
                title="Counterparty"
                value={
                  viewing.counterparty_name
                }
              />

              <Detail
                title="Posted By"
                value={
                  viewing.poster?.name ??
                  "—"
                }
              />

              <Detail
                title="Posted At"
                value={formatDateTime(
                  viewing.posted_at,
                )}
              />

              <Detail
                title="Reference"
                value={
                  viewing.reference_number ??
                  "—"
                }
              />

              <Detail
                title="Receipt"
                value={
                  viewing.receipt_number ??
                  "—"
                }
              />
            </div>

            <TextBlock
              title="Purpose"
              text={
                viewing.purpose
              }
            />

            {viewing.expense && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4">
                <p className="text-xs font-extrabold uppercase text-emerald-800">
                  Linked Expense
                </p>

                <div className="mt-3 grid gap-4 sm:grid-cols-4">
                  <Info
                    title="Expense"
                    value={
                      viewing.expense
                        .expense_code
                    }
                  />

                  <Info
                    title="Category"
                    value={
                      viewing.expense
                        .category
                    }
                  />

                  <Info
                    title="Amount"
                    value={formatMoney(
                      viewing.expense
                        .amount,
                      viewing.expense
                        .currency,
                    )}
                  />

                  <Info
                    title="Status"
                    value={label(
                      viewing.expense
                        .status,
                    )}
                  />
                </div>
              </div>
            )}

            {viewing.notes && (
              <TextBlock
                title="Notes"
                text={
                  viewing.notes
                }
              />
            )}

            {viewing.status ===
              "reversed" && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-4">
                <p className="text-xs font-extrabold uppercase text-red-800">
                  Reversal
                </p>

                <p className="mt-2 text-sm font-semibold text-red-900">
                  {viewing.reversal_reason ??
                    "No reversal reason recorded."}
                </p>

                <p className="mt-2 text-xs font-medium text-red-800">
                  By:{" "}
                  {viewing.reverser
                    ?.name ??
                    "—"}{" "}
                  ·{" "}
                  {formatDateTime(
                    viewing.reversed_at,
                  )}
                </p>
              </div>
            )}
          </ModalCard>
        </Modal>
      )}
    </div>
  );
}

function TypeBadge({
  type,
}: {
  type: PettyCashTransactionType;
}) {
  const styles: Record<
    PettyCashTransactionType,
    string
  > = {
    fund_in:
      "bg-emerald-100 text-emerald-900",

    expense:
      "bg-red-100 text-red-900",

    reversal:
      "bg-slate-200 text-slate-900",
  };

  return (
    <span
      className={`rounded-md px-2.5 py-1 text-xs font-extrabold ${styles[type]}`}
    >
      {label(type)}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: PettyCashStatus;
}) {
  return (
    <span
      className={`rounded-md px-2.5 py-1 text-xs font-extrabold ${
        status === "posted"
          ? "bg-emerald-100 text-emerald-900"
          : "bg-red-100 text-red-900"
      }`}
    >
      {label(status)}
    </span>
  );
}

function Metric({
  title,
  value,
  icon,
  green = false,
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
  green?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-extrabold uppercase text-slate-700">
          {title}
        </p>

        <span
          className={
            green
              ? "text-[#075b38]"
              : "text-[#80570f]"
          }
        >
          {icon}
        </span>
      </div>

      <p
        className={`mt-2 text-2xl font-extrabold ${
          green
            ? "text-[#075b38]"
            : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function MiniMetric({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-300 bg-white px-4 py-3">
      <p className="text-xs font-extrabold uppercase text-slate-600">
        {title}
      </p>

      <p className="mt-1 text-lg font-extrabold">
        {value}
      </p>
    </div>
  );
}

function Field({
  label: title,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold">
        {title}
      </label>

      {children}
    </div>
  );
}

function Info({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-extrabold uppercase text-[#80570f]">
        {title}
      </p>

      <p className="mt-1 text-sm font-bold">
        {value}
      </p>
    </div>
  );
}

function Detail({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="border-b border-slate-300 py-4">
      <p className="text-xs font-extrabold uppercase text-slate-600">
        {title}
      </p>

      <p className="mt-1.5 text-sm font-bold">
        {value}
      </p>
    </div>
  );
}

function TextBlock({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-slate-300 bg-slate-50 p-4">
      <p className="text-xs font-extrabold uppercase text-slate-600">
        {title}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm font-medium">
        {text}
      </p>
    </div>
  );
}

function IconButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-400 bg-white hover:bg-slate-100"
    >
      {children}
    </button>
  );
}

function Actions({
  busy,
  cancel,
  submit,
  text,
}: {
  busy: boolean;
  cancel: () => void;
  submit: () => void;
  text: string;
}) {
  return (
    <div className="flex justify-end gap-2 border-t border-slate-300 pt-4">
      <button
        type="button"
        disabled={busy}
        onClick={cancel}
        className="h-10 rounded-lg border border-slate-400 px-4 text-sm font-bold disabled:opacity-50"
      >
        Cancel
      </button>

      <button
        type="button"
        disabled={busy}
        onClick={submit}
        className="h-10 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white disabled:opacity-50"
      >
        {busy
          ? "Saving..."
          : text}
      </button>
    </div>
  );
}

function Pagination({
  page,
  lastPage,
  total,
  setPage,
}: {
  page: number;
  lastPage: number;
  total: number;
  setPage: (
    value: number,
  ) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-300 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-slate-700">
        {total} transactions · Page{" "}
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
          className="h-9 rounded-lg border border-slate-400 px-4 text-sm font-bold disabled:opacity-40"
        >
          Previous
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
          className="h-9 rounded-lg border border-slate-400 px-4 text-sm font-bold disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function Modal({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      {children}
    </div>
  );
}

function ModalCard({
  title,
  subtitle,
  close,
  children,
}: {
  title: string;
  subtitle: string;
  close: () => void;
  children: ReactNode;
}) {
  return (
    <div className="w-full max-w-4xl rounded-xl bg-white shadow-2xl">
      <div className="flex items-start justify-between border-b border-slate-300 px-6 py-4">
        <div>
          <h2 className="text-xl font-extrabold">
            {title}
          </h2>

          <p className="mt-1 text-sm font-medium text-slate-600">
            {subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={close}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-400"
        >
          <X size={18} />
        </button>
      </div>

      <div className="max-h-[78vh] space-y-4 overflow-y-auto p-6">
        {children}
      </div>
    </div>
  );
}

function Notice({
  text,
  error = false,
}: {
  text: string;
  error?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm font-semibold ${
        error
          ? "border-red-300 bg-red-50 text-red-900"
          : "border-emerald-300 bg-emerald-50 text-emerald-900"
      }`}
    >
      {text}
    </div>
  );
}

function label(
  value: string,
) {
  return value
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function formatMoney(
  value: string | number,
  currency = "RWF",
) {
  const parsed =
    Number(value);

  return `${new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 0,
    },
  ).format(
    Number.isFinite(parsed)
      ? parsed
      : 0,
  )} ${currency}`;
}

function formatDateTime(
  value?: string | null,
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

function todayInput() {
  const now =
    new Date();

  const offset =
    now.getTimezoneOffset();

  return new Date(
    now.getTime() -
      offset * 60_000,
  )
    .toISOString()
    .slice(0, 10);
}

function errorMessage(
  error: unknown,
) {
  return error instanceof Error
    ? error.message
    : "Something went wrong.";
}
