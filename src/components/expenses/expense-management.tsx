"use client";

import {
  Banknote,
  CalendarDays,
  CheckCircle2,
  Eye,
  FileText,
  LoaderCircle,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  WalletCards,
  X,
} from "lucide-react";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  cancelExpense,
  createExpense,
  getExpense,
  getExpenseCategories,
  getExpenseRole,
  getExpenses,
  getExpenseSummary,
  recordExpense,
  updateExpense,
} from "@/services/expense-service";

import type {
  DashboardRole,
  Expense,
  ExpensePaymentMethod,
  ExpenseStatus,
  ExpenseSummary,
} from "@/types/expense";

const inputClass =
  "h-11 w-full rounded-lg border border-slate-400 bg-white px-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-600 focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

const textareaClass =
  "min-h-24 w-full rounded-lg border border-slate-400 bg-white px-3 py-2.5 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-600 focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

const commonCategories = [
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

const emptySummary: ExpenseSummary = {
  total_expenses: 0,
  draft_expenses: 0,
  recorded_expenses: 0,
  cancelled_expenses: 0,

  total_recorded_amount: "0.00",
  today_amount: "0.00",
  this_month_amount: "0.00",

  currency: "RWF",
};

export default function ExpenseManagement() {
  const [items, setItems] =
    useState<Expense[]>([]);

  const [summary, setSummary] =
    useState<ExpenseSummary>(
      emptySummary,
    );

  const [categories, setCategories] =
    useState<string[]>(
      commonCategories,
    );

  const [role, setRole] =
    useState<DashboardRole>("");

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("");

  const [
    paymentMethodFilter,
    setPaymentMethodFilter,
  ] = useState("");

  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");

  const [filters, setFilters] =
    useState({
      search: "",
      status: "",
      category: "",
      paymentMethod: "",
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

  const [editing, setEditing] =
    useState<Expense | null>(
      null,
    );

  const [viewing, setViewing] =
    useState<Expense | null>(
      null,
    );

  const [
    cancelTarget,
    setCancelTarget,
  ] =
    useState<Expense | null>(
      null,
    );

  const [
    expenseDate,
    setExpenseDate,
  ] = useState("");

  const [category, setCategory] =
    useState("");

  const [payeeName, setPayeeName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState<ExpensePaymentMethod>(
      "cash",
    );

  const [
    paymentReference,
    setPaymentReference,
  ] = useState("");

  const [
    receiptNumber,
    setReceiptNumber,
  ] = useState("");

  const [notes, setNotes] =
    useState("");

  const [
    cancellationReason,
    setCancellationReason,
  ] = useState("");

  const canManage =
    role === "admin" ||
    role === "accountant";

  const referenceRequired =
    paymentMethod ===
      "mobile_money" ||
    paymentMethod ===
      "bank_transfer";

  const load = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const [list, totals] =
          await Promise.all([
            getExpenses({
              search:
                filters.search ||
                undefined,

              status:
                filters.status
                  ? (
                      filters.status as ExpenseStatus
                    )
                  : undefined,

              category:
                filters.category ||
                undefined,

              payment_method:
                filters.paymentMethod
                  ? (
                      filters.paymentMethod as ExpensePaymentMethod
                    )
                  : undefined,

              date_from:
                filters.dateFrom ||
                undefined,

              date_to:
                filters.dateTo ||
                undefined,

              page,
              per_page: 15,
            }),

            getExpenseSummary(),
          ]);

        setItems(
          list.items,
        );

        setSummary(
          totals,
        );

        setTotal(
          list.pagination.total,
        );

        setLastPage(
          Math.max(
            list.pagination.last_page,
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
        const [
          currentRole,
          usedCategories,
        ] =
          await Promise.all([
            getExpenseRole(),
            getExpenseCategories(),
          ]);

        setRole(
          currentRole,
        );

        setCategories(
          Array.from(
            new Set([
              ...commonCategories,
              ...usedCategories,
            ]),
          ).sort(),
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

      status,

      category:
        categoryFilter,

      paymentMethod:
        paymentMethodFilter,

      dateFrom,

      dateTo,
    });

    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setStatus("");
    setCategoryFilter("");
    setPaymentMethodFilter("");
    setDateFrom("");
    setDateTo("");

    setFilters({
      search: "",
      status: "",
      category: "",
      paymentMethod: "",
      dateFrom: "",
      dateTo: "",
    });

    setPage(1);
  }

  function resetForm() {
    setExpenseDate(
      todayInput(),
    );

    setCategory("");
    setPayeeName("");
    setDescription("");
    setAmount("");
    setPaymentMethod("cash");
    setPaymentReference("");
    setReceiptNumber("");
    setNotes("");
  }

  function openCreate() {
    setError("");
    setSuccess("");

    resetForm();

    setCreateOpen(true);
  }

  function validateForm() {
    if (!expenseDate) {
      setError(
        "Expense date is required.",
      );
      return false;
    }

    if (
      category.trim().length <
      2
    ) {
      setError(
        "Expense category is required.",
      );
      return false;
    }

    if (
      payeeName.trim().length <
      2
    ) {
      setError(
        "Payee name is required.",
      );
      return false;
    }

    if (
      description.trim().length <
      3
    ) {
      setError(
        "Expense description is required.",
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
        "Expense amount must be greater than zero.",
      );
      return false;
    }

    if (
      referenceRequired &&
      !paymentReference.trim()
    ) {
      setError(
        "Payment reference is required for Mobile Money and Bank Transfer.",
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
      await createExpense({
        expense_date:
          expenseDate,

        category:
          category.trim(),

        payee_name:
          payeeName.trim(),

        description:
          description.trim(),

        amount:
          Number(amount),

        payment_method:
          paymentMethod,

        payment_reference:
          paymentReference.trim() ||
          undefined,

        receipt_number:
          receiptNumber.trim() ||
          undefined,

        notes:
          notes.trim() ||
          undefined,
      });

      setCreateOpen(false);

      setSuccess(
        "Expense draft created successfully.",
      );

      await refreshAll();
    } catch (error) {
      setError(
        errorMessage(error),
      );
    } finally {
      setBusy(false);
    }
  }

  function openEdit(
    expense: Expense,
  ) {
    setEditing(
      expense,
    );

    setExpenseDate(
      expense.expense_date,
    );

    setCategory(
      expense.category,
    );

    setPayeeName(
      expense.payee_name,
    );

    setDescription(
      expense.description,
    );

    setAmount(
      expense.amount,
    );

    setPaymentMethod(
      expense.payment_method,
    );

    setPaymentReference(
      expense.payment_reference ??
        "",
    );

    setReceiptNumber(
      expense.receipt_number ??
        "",
    );

    setNotes(
      expense.notes ?? "",
    );
  }

  async function submitEdit() {
    if (
      !editing ||
      !validateForm()
    ) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await updateExpense(
        editing.id,
        {
          expense_date:
            expenseDate,

          category:
            category.trim(),

          payee_name:
            payeeName.trim(),

          description:
            description.trim(),

          amount:
            Number(amount),

          payment_method:
            paymentMethod,

          payment_reference:
            paymentReference.trim() ||
            null,

          receipt_number:
            receiptNumber.trim() ||
            null,

          notes:
            notes.trim() ||
            null,
        },
      );

      setEditing(null);

      setSuccess(
        "Expense updated successfully.",
      );

      await refreshAll();
    } catch (error) {
      setError(
        errorMessage(error),
      );
    } finally {
      setBusy(false);
    }
  }

  async function markRecorded(
    expense: Expense,
  ) {
    const confirmed =
      window.confirm(
        `Record ${expense.expense_code} for ${formatMoney(
          expense.amount,
          expense.currency,
        )}? After recording it, the financial details cannot be edited.`,
      );

    if (!confirmed) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await recordExpense(
        expense.id,
      );

      setSuccess(
        `${expense.expense_code} recorded successfully.`,
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

  async function openView(
    expense: Expense,
  ) {
    try {
      setViewing(
        await getExpense(
          expense.id,
        ),
      );
    } catch (error) {
      setError(
        errorMessage(error),
      );
    }
  }

  async function submitCancel() {
    if (!cancelTarget) {
      return;
    }

    if (
      cancellationReason
        .trim()
        .length < 3
    ) {
      setError(
        "Cancellation reason is required.",
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      await cancelExpense(
        cancelTarget.id,
        cancellationReason.trim(),
      );

      setCancelTarget(null);
      setCancellationReason("");

      setSuccess(
        "Expense cancelled successfully.",
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

  async function refreshAll() {
    try {
      const usedCategories =
        await getExpenseCategories();

      setCategories(
        Array.from(
          new Set([
            ...commonCategories,
            ...usedCategories,
          ]),
        ).sort(),
      );
    } catch {
      // Expense list can still refresh even if category lookup fails.
    }

    await load();
  }

  return (
    <div className="space-y-5 text-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold">
            Expenses
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-700">
            Record and monitor
            operational expenses for
            the coffee washing station.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={
              openCreate
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white hover:bg-[#064a2f]"
          >
            <Plus size={17} />
            New Expense
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Total Recorded"
          value={formatMoney(
            summary.total_recorded_amount,
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
          title="This Month"
          value={formatMoney(
            summary.this_month_amount,
            summary.currency,
          )}
          icon={
            <CalendarDays
              size={19}
            />
          }
        />

        <Metric
          title="Today"
          value={formatMoney(
            summary.today_amount,
            summary.currency,
          )}
          icon={
            <Banknote
              size={19}
            />
          }
        />

        <Metric
          title="Recorded Expenses"
          value={
            summary.recorded_expenses
          }
          icon={
            <ReceiptText
              size={19}
            />
          }
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <MiniMetric
          title="Total Records"
          value={String(
            summary.total_expenses,
          )}
        />

        <MiniMetric
          title="Draft Expenses"
          value={String(
            summary.draft_expenses,
          )}
        />

        <MiniMetric
          title="Cancelled"
          value={String(
            summary.cancelled_expenses,
          )}
        />
      </div>

      <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1fr_180px_170px_170px_150px_150px_auto_auto]">
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
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  applyFilters();
                }
              }}
              placeholder="Search expense, payee, receipt or reference..."
              className="h-11 w-full rounded-lg border border-slate-400 bg-white pl-9 pr-3 text-sm font-medium outline-none placeholder:text-slate-600 focus:border-[#075b38]"
            />
          </div>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value,
              )
            }
            className={inputClass}
          >
            <option value="">
              All Statuses
            </option>

            <option value="draft">
              Draft
            </option>

            <option value="recorded">
              Recorded
            </option>

            <option value="cancelled">
              Cancelled
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

            {categories.map(
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

          <select
            value={
              paymentMethodFilter
            }
            onChange={(event) =>
              setPaymentMethodFilter(
                event.target.value,
              )
            }
            className={inputClass}
          >
            <option value="">
              All Payments
            </option>

            <option value="cash">
              Cash
            </option>

            <option value="mobile_money">
              Mobile Money
            </option>

            <option value="bank_transfer">
              Bank Transfer
            </option>

            <option value="other">
              Other
            </option>
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
          <table className="w-full min-w-[1400px]">
            <thead className="bg-[#f6f1e8]">
              <tr className="border-b border-slate-300 text-left text-xs font-extrabold uppercase text-slate-800">
                <th className="px-4 py-4">
                  Expense
                </th>

                <th className="px-4 py-4">
                  Date
                </th>

                <th className="px-4 py-4">
                  Category
                </th>

                <th className="px-4 py-4">
                  Payee
                </th>

                <th className="px-4 py-4">
                  Description
                </th>

                <th className="px-4 py-4">
                  Amount
                </th>

                <th className="px-4 py-4">
                  Payment
                </th>

                <th className="px-4 py-4">
                  Receipt
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
                    colSpan={10}
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
                  (expense) => (
                    <tr
                      key={expense.id}
                      className="border-b border-slate-200 text-sm hover:bg-[#fffdf8]"
                    >
                      <td className="px-4 py-4">
                        <p className="font-extrabold text-[#80570f]">
                          {
                            expense.expense_code
                          }
                        </p>
                      </td>

                      <td className="px-4 py-4 font-semibold">
                        {
                          expense.expense_date
                        }
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-md bg-[#f6f1e8] px-2.5 py-1 text-xs font-bold text-[#6b4a13]">
                          {
                            expense.category
                          }
                        </span>
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {
                          expense.payee_name
                        }
                      </td>

                      <td className="max-w-[240px] px-4 py-4">
                        <p className="truncate font-medium">
                          {
                            expense.description
                          }
                        </p>
                      </td>

                      <td className="px-4 py-4 font-extrabold text-[#075b38]">
                        {formatMoney(
                          expense.amount,
                          expense.currency,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-bold">
                          {label(
                            expense.payment_method,
                          )}
                        </p>

                        {expense.payment_reference && (
                          <p className="mt-1 text-xs text-slate-600">
                            {
                              expense.payment_reference
                            }
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {expense.receipt_number ??
                          "—"}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          status={
                            expense.status
                          }
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-2">
                          <IconButton
                            title="View"
                            onClick={() =>
                              void openView(
                                expense,
                              )
                            }
                          >
                            <Eye size={15} />
                          </IconButton>

                          {canManage &&
                            expense.status ===
                              "draft" && (
                              <>
                                <IconButton
                                  title="Edit"
                                  onClick={() =>
                                    openEdit(
                                      expense,
                                    )
                                  }
                                >
                                  <Pencil
                                    size={
                                      15
                                    }
                                  />
                                </IconButton>

                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() =>
                                    void markRecorded(
                                      expense,
                                    )
                                  }
                                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#075b38] px-3 text-xs font-bold text-white disabled:opacity-50"
                                >
                                  <CheckCircle2
                                    size={
                                      14
                                    }
                                  />
                                  Record
                                </button>
                              </>
                            )}

                          {canManage &&
                            expense.status !==
                              "cancelled" && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => {
                                  setCancelTarget(
                                    expense,
                                  );

                                  setCancellationReason(
                                    "",
                                  );
                                }}
                                className="h-9 rounded-lg border border-red-300 px-3 text-xs font-bold text-red-800 hover:bg-red-50 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="py-16 text-center"
                  >
                    <ReceiptText
                      size={40}
                      className="mx-auto text-slate-400"
                    />

                    <p className="mt-3 font-bold">
                      No Expenses found.
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
            title="New Expense"
            subtitle="Create an operational Expense as draft before recording it."
            close={() =>
              setCreateOpen(false)
            }
          >
            <ExpenseForm
              expenseDate={
                expenseDate
              }
              setExpenseDate={
                setExpenseDate
              }
              category={
                category
              }
              setCategory={
                setCategory
              }
              categories={
                categories
              }
              payeeName={
                payeeName
              }
              setPayeeName={
                setPayeeName
              }
              description={
                description
              }
              setDescription={
                setDescription
              }
              amount={
                amount
              }
              setAmount={
                setAmount
              }
              paymentMethod={
                paymentMethod
              }
              setPaymentMethod={
                setPaymentMethod
              }
              paymentReference={
                paymentReference
              }
              setPaymentReference={
                setPaymentReference
              }
              receiptNumber={
                receiptNumber
              }
              setReceiptNumber={
                setReceiptNumber
              }
              notes={notes}
              setNotes={
                setNotes
              }
            />

            <Actions
              busy={busy}
              cancel={() =>
                setCreateOpen(false)
              }
              submit={() =>
                void submitCreate()
              }
              text="Create Draft"
            />
          </ModalCard>
        </Modal>
      )}

      {editing && (
        <Modal>
          <ModalCard
            title={`Edit ${editing.expense_code}`}
            subtitle="Only draft Expenses can be edited."
            close={() =>
              setEditing(null)
            }
          >
            <ExpenseForm
              expenseDate={
                expenseDate
              }
              setExpenseDate={
                setExpenseDate
              }
              category={
                category
              }
              setCategory={
                setCategory
              }
              categories={
                categories
              }
              payeeName={
                payeeName
              }
              setPayeeName={
                setPayeeName
              }
              description={
                description
              }
              setDescription={
                setDescription
              }
              amount={
                amount
              }
              setAmount={
                setAmount
              }
              paymentMethod={
                paymentMethod
              }
              setPaymentMethod={
                setPaymentMethod
              }
              paymentReference={
                paymentReference
              }
              setPaymentReference={
                setPaymentReference
              }
              receiptNumber={
                receiptNumber
              }
              setReceiptNumber={
                setReceiptNumber
              }
              notes={notes}
              setNotes={
                setNotes
              }
            />

            <Actions
              busy={busy}
              cancel={() =>
                setEditing(null)
              }
              submit={() =>
                void submitEdit()
              }
              text="Save Changes"
            />
          </ModalCard>
        </Modal>
      )}

      {cancelTarget && (
        <Modal>
          <ModalCard
            title={`Cancel ${cancelTarget.expense_code}`}
            subtitle="The Expense will remain in the financial history and will not be deleted."
            close={() =>
              setCancelTarget(null)
            }
          >
            {cancelTarget.status ===
              "recorded" && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
                <p className="font-bold text-amber-950">
                  Recorded amount:{" "}
                  {formatMoney(
                    cancelTarget.amount,
                    cancelTarget.currency,
                  )}
                </p>

                <p className="mt-1 text-xs font-medium text-amber-800">
                  This cancellation
                  removes the Expense
                  from active recorded
                  totals while keeping
                  its complete audit
                  history.
                </p>
              </div>
            )}

            <Field label="Cancellation Reason">
              <textarea
                value={
                  cancellationReason
                }
                onChange={(event) =>
                  setCancellationReason(
                    event.target.value,
                  )
                }
                placeholder="Explain why this Expense is being cancelled..."
                className={textareaClass}
              />
            </Field>

            <div className="flex justify-end gap-2 border-t border-slate-300 pt-4">
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  setCancelTarget(null)
                }
                className="h-10 rounded-lg border border-slate-400 px-4 text-sm font-bold"
              >
                Keep Expense
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  void submitCancel()
                }
                className="h-10 rounded-lg bg-red-700 px-5 text-sm font-bold text-white disabled:opacity-50"
              >
                {busy
                  ? "Cancelling..."
                  : "Cancel Expense"}
              </button>
            </div>
          </ModalCard>
        </Modal>
      )}

      {viewing && (
        <Modal>
          <ModalCard
            title={
              viewing.expense_code
            }
            subtitle="Expense details and financial accountability."
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
                title="Date"
                value={
                  viewing.expense_date
                }
              />

              <Detail
                title="Category"
                value={
                  viewing.category
                }
              />

              <Detail
                title="Payee"
                value={
                  viewing.payee_name
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
                title="Payment Method"
                value={label(
                  viewing.payment_method,
                )}
              />

              <Detail
                title="Payment Reference"
                value={
                  viewing.payment_reference ??
                  "—"
                }
              />

              <Detail
                title="Receipt Number"
                value={
                  viewing.receipt_number ??
                  "—"
                }
              />

              <Detail
                title="Created By"
                value={
                  viewing.creator?.name ??
                  "—"
                }
              />

              <Detail
                title="Recorded By"
                value={
                  viewing.recorder?.name ??
                  "—"
                }
              />

              <Detail
                title="Recorded At"
                value={formatDateTime(
                  viewing.recorded_at,
                )}
              />

              <Detail
                title="Source"
                value={
                  viewing.source_type
                    ? `${label(
                        viewing.source_type,
                      )} #${
                        viewing.source_id ??
                        "—"
                      }`
                    : "Manual Expense"
                }
              />
            </div>

            <TextBlock
              title="Description"
              text={
                viewing.description
              }
            />

            {viewing.notes && (
              <TextBlock
                title="Notes"
                text={
                  viewing.notes
                }
              />
            )}

            {viewing.status ===
              "cancelled" && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-4">
                <p className="text-xs font-extrabold uppercase text-red-800">
                  Cancellation
                </p>

                <p className="mt-2 text-sm font-semibold text-red-900">
                  {viewing.cancellation_reason ??
                    "No reason recorded."}
                </p>

                <p className="mt-2 text-xs font-medium text-red-800">
                  By:{" "}
                  {viewing.canceller
                    ?.name ??
                    "—"}{" "}
                  ·{" "}
                  {formatDateTime(
                    viewing.cancelled_at,
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

function ExpenseForm({
  expenseDate,
  setExpenseDate,
  category,
  setCategory,
  categories,
  payeeName,
  setPayeeName,
  description,
  setDescription,
  amount,
  setAmount,
  paymentMethod,
  setPaymentMethod,
  paymentReference,
  setPaymentReference,
  receiptNumber,
  setReceiptNumber,
  notes,
  setNotes,
}: {
  expenseDate: string;
  setExpenseDate: (
    value: string,
  ) => void;

  category: string;
  setCategory: (
    value: string,
  ) => void;

  categories: string[];

  payeeName: string;
  setPayeeName: (
    value: string,
  ) => void;

  description: string;
  setDescription: (
    value: string,
  ) => void;

  amount: string;
  setAmount: (
    value: string,
  ) => void;

  paymentMethod: ExpensePaymentMethod;
  setPaymentMethod: (
    value: ExpensePaymentMethod,
  ) => void;

  paymentReference: string;
  setPaymentReference: (
    value: string,
  ) => void;

  receiptNumber: string;
  setReceiptNumber: (
    value: string,
  ) => void;

  notes: string;
  setNotes: (
    value: string,
  ) => void;
}) {
  const referenceRequired =
    paymentMethod ===
      "mobile_money" ||
    paymentMethod ===
      "bank_transfer";

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Expense Date">
          <input
            type="date"
            max={todayInput()}
            value={
              expenseDate
            }
            onChange={(event) =>
              setExpenseDate(
                event.target.value,
              )
            }
            className={inputClass}
          />
        </Field>

        <Field label="Category">
          <input
            list="expense-category-options"
            value={category}
            onChange={(event) =>
              setCategory(
                event.target.value,
              )
            }
            placeholder="Example: Fuel"
            className={inputClass}
          />

          <datalist id="expense-category-options">
            {categories.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                />
              ),
            )}
          </datalist>
        </Field>
      </div>

      <Field label="Payee Name">
        <input
          value={payeeName}
          onChange={(event) =>
            setPayeeName(
              event.target.value,
            )
          }
          placeholder="Person or company paid"
          className={inputClass}
        />
      </Field>

      <Field label="Description">
        <textarea
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value,
            )
          }
          placeholder="Describe what this Expense was for..."
          className={textareaClass}
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
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
            className={inputClass}
          />
        </Field>

        <Field label="Payment Method">
          <select
            value={
              paymentMethod
            }
            onChange={(event) => {
              const value =
                event.target
                  .value as ExpensePaymentMethod;

              setPaymentMethod(
                value,
              );

              if (
                value === "cash"
              ) {
                setPaymentReference(
                  "",
                );
              }
            }}
            className={inputClass}
          >
            <option value="cash">
              Cash
            </option>

            <option value="mobile_money">
              Mobile Money
            </option>

            <option value="bank_transfer">
              Bank Transfer
            </option>

            <option value="other">
              Other
            </option>
          </select>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label={
            referenceRequired
              ? "Payment Reference *"
              : "Payment Reference"
          }
        >
          <input
            value={
              paymentReference
            }
            onChange={(event) =>
              setPaymentReference(
                event.target.value,
              )
            }
            placeholder={
              paymentMethod ===
              "mobile_money"
                ? "Mobile Money transaction reference"
                : paymentMethod ===
                    "bank_transfer"
                  ? "Bank transaction reference"
                  : "Optional reference"
            }
            className={inputClass}
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
            placeholder="Optional receipt number"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="rounded-lg border border-[#d9c9ae] bg-[#fffaf2] p-4">
        <p className="text-sm font-bold text-[#6b4a13]">
          Currency: RWF
        </p>

        <p className="mt-1 text-xs font-medium text-slate-700">
          The backend controls the
          currency and financial status
          of the Expense.
        </p>
      </div>

      <Field label="Notes">
        <textarea
          value={notes}
          onChange={(event) =>
            setNotes(
              event.target.value,
            )
          }
          placeholder="Optional notes..."
          className={textareaClass}
        />
      </Field>
    </>
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

      <p className="mt-1 text-xl font-extrabold">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: ExpenseStatus;
}) {
  const styles: Record<
    ExpenseStatus,
    string
  > = {
    draft:
      "bg-slate-100 text-slate-800",

    recorded:
      "bg-emerald-100 text-emerald-900",

    cancelled:
      "bg-red-100 text-red-900",
  };

  return (
    <span
      className={`rounded-md px-2.5 py-1 text-xs font-extrabold ${styles[status]}`}
    >
      {label(status)}
    </span>
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
        {total} expenses · Page{" "}
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
