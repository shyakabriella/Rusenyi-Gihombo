"use client";

import {
  Banknote,
  Calculator,
  CheckCircle2,
  CircleDollarSign,
  Eye,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  UserRound,
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
  cancelPayroll,
  createPayroll,
  getPayroll,
  getPayrollEmployees,
  getPayrollRole,
  getPayrolls,
  getPayrollSummary,
  payPayroll,
  processPayroll,
  updatePayroll,
} from "@/services/payroll-service";

import type {
  DashboardRole,
  Payroll,
  PayrollEmployee,
  PayrollPaymentMethod,
  PayrollStatus,
  PayrollSummary,
} from "@/types/payroll";

const inputClass =
  "h-11 w-full rounded-lg border border-slate-400 bg-white px-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-600 focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

const textareaClass =
  "min-h-24 w-full rounded-lg border border-slate-400 bg-white px-3 py-2.5 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-600 focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

const emptySummary: PayrollSummary = {
  payroll_month: "",
  total_records: 0,
  draft_records: 0,
  processed_records: 0,
  paid_records: 0,
  gross_payroll: "0.00",
  total_deductions: "0.00",
  net_payroll: "0.00",
  total_paid: "0.00",
  currency: "RWF",
};

export default function PayrollManagement() {
  const [items, setItems] =
    useState<Payroll[]>([]);

  const [employees, setEmployees] =
    useState<PayrollEmployee[]>([]);

  const [summary, setSummary] =
    useState<PayrollSummary>(
      emptySummary,
    );

  const [role, setRole] =
    useState<DashboardRole>("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [monthFilter, setMonthFilter] =
    useState(currentMonth());

  const [employeeFilter, setEmployeeFilter] =
    useState("");

  const [filters, setFilters] =
    useState({
      search: "",
      status: "",
      month: currentMonth(),
      employee: "",
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
    useState<Payroll | null>(
      null,
    );

  const [viewing, setViewing] =
    useState<Payroll | null>(
      null,
    );

  const [payTarget, setPayTarget] =
    useState<Payroll | null>(
      null,
    );

  const [cancelTarget, setCancelTarget] =
    useState<Payroll | null>(
      null,
    );

  const [employeeId, setEmployeeId] =
    useState("");

  const [payrollMonth, setPayrollMonth] =
    useState(currentMonth());

  const [basicSalary, setBasicSalary] =
    useState("");

  const [allowances, setAllowances] =
    useState("0");

  const [deductions, setDeductions] =
    useState("0");

  const [notes, setNotes] =
    useState("");

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState<PayrollPaymentMethod>(
      "cash",
    );

  const [
    paymentReference,
    setPaymentReference,
  ] = useState("");

  const [paymentDate, setPaymentDate] =
    useState(todayInput());

  const [
    cancellationReason,
    setCancellationReason,
  ] = useState("");

  const canManage =
    role === "admin" ||
    role === "accountant";

  const salaryPreview =
    useMemo(() => {
      const basic =
        Number(basicSalary);

      const allowance =
        Number(allowances || 0);

      const deduction =
        Number(deductions || 0);

      if (
        !Number.isFinite(basic) ||
        basic <= 0 ||
        !Number.isFinite(allowance) ||
        allowance < 0 ||
        !Number.isFinite(deduction) ||
        deduction < 0
      ) {
        return null;
      }

      const gross =
        basic + allowance;

      return {
        basic,
        allowance,
        gross,
        deduction,
        net:
          gross - deduction,
      };
    }, [
      basicSalary,
      allowances,
      deductions,
    ]);

  const load = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const [list, totals] =
          await Promise.all([
            getPayrolls({
              search:
                filters.search ||
                undefined,

              status:
                filters.status
                  ? (
                      filters.status as PayrollStatus
                    )
                  : undefined,

              payroll_month:
                filters.month ||
                undefined,

              employee_id:
                filters.employee
                  ? Number(
                      filters.employee,
                    )
                  : undefined,

              page,
              per_page: 15,
            }),

            getPayrollSummary(
              filters.month ||
                undefined,
            ),
          ]);

        setItems(list.items);
        setSummary(totals);

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
          employeeItems,
        ] =
          await Promise.all([
            getPayrollRole(),
            getPayrollEmployees(),
          ]);

        setRole(currentRole);
        setEmployees(employeeItems);
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

      status:
        statusFilter,

      month:
        monthFilter,

      employee:
        employeeFilter,
    });

    setPage(1);
  }

  function resetFilters() {
    const month =
      currentMonth();

    setSearch("");
    setStatusFilter("");
    setMonthFilter(month);
    setEmployeeFilter("");

    setFilters({
      search: "",
      status: "",
      month,
      employee: "",
    });

    setPage(1);
  }

  function resetForm() {
    setEmployeeId("");
    setPayrollMonth(
      filters.month ||
        currentMonth(),
    );
    setBasicSalary("");
    setAllowances("0");
    setDeductions("0");
    setNotes("");
  }

  function openCreate() {
    setError("");
    setSuccess("");

    resetForm();
    setCreateOpen(true);
  }

  function validatePayrollForm() {
    if (!employeeId) {
      setError(
        "Select an employee.",
      );
      return false;
    }

    if (!payrollMonth) {
      setError(
        "Payroll month is required.",
      );
      return false;
    }

    const basic =
      Number(basicSalary);

    const allowance =
      Number(allowances || 0);

    const deduction =
      Number(deductions || 0);

    if (
      !Number.isFinite(basic) ||
      basic <= 0
    ) {
      setError(
        "Basic salary must be greater than zero.",
      );
      return false;
    }

    if (
      !Number.isFinite(allowance) ||
      allowance < 0
    ) {
      setError(
        "Allowances cannot be negative.",
      );
      return false;
    }

    if (
      !Number.isFinite(deduction) ||
      deduction < 0
    ) {
      setError(
        "Deductions cannot be negative.",
      );
      return false;
    }

    if (
      deduction >
      basic + allowance
    ) {
      setError(
        "Deductions cannot exceed Gross Salary.",
      );
      return false;
    }

    return true;
  }

  async function submitCreate() {
    if (
      !validatePayrollForm()
    ) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const result =
        await createPayroll({
          employee_id:
            Number(employeeId),

          payroll_month:
            payrollMonth,

          basic_salary:
            Number(basicSalary),

          allowances:
            Number(
              allowances || 0,
            ),

          deductions:
            Number(
              deductions || 0,
            ),

          notes:
            notes.trim() ||
            undefined,
        });

      setCreateOpen(false);

      setSuccess(
        `${result.payroll_code} created successfully.`,
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

  function openEdit(
    payroll: Payroll,
  ) {
    setEditing(payroll);

    setEmployeeId(
      String(
        payroll.employee_id,
      ),
    );

    setPayrollMonth(
      payroll.payroll_month,
    );

    setBasicSalary(
      payroll.basic_salary,
    );

    setAllowances(
      payroll.allowances,
    );

    setDeductions(
      payroll.deductions,
    );

    setNotes(
      payroll.notes ?? "",
    );
  }

  async function submitEdit() {
    if (
      !editing ||
      !validatePayrollForm()
    ) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await updatePayroll(
        editing.id,
        {
          employee_id:
            Number(employeeId),

          payroll_month:
            payrollMonth,

          basic_salary:
            Number(basicSalary),

          allowances:
            Number(
              allowances || 0,
            ),

          deductions:
            Number(
              deductions || 0,
            ),

          notes:
            notes.trim() ||
            null,
        },
      );

      setEditing(null);

      setSuccess(
        "Payroll updated successfully.",
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

  async function markProcessed(
    payroll: Payroll,
  ) {
    const confirmed =
      window.confirm(
        `Process ${payroll.payroll_code} for ${payroll.employee_name}? Once processed, salary values can no longer be edited.`,
      );

    if (!confirmed) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await processPayroll(
        payroll.id,
      );

      setSuccess(
        `${payroll.payroll_code} processed successfully.`,
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

  function openPay(
    payroll: Payroll,
  ) {
    setPayTarget(payroll);

    setPaymentMethod(
      "cash",
    );

    setPaymentReference(
      "",
    );

    setPaymentDate(
      todayInput(),
    );
  }

  async function submitPay() {
    if (!payTarget) {
      return;
    }

    if (!paymentDate) {
      setError(
        "Payment date is required.",
      );
      return;
    }

    if (
      (
        paymentMethod ===
          "mobile_money" ||
        paymentMethod ===
          "bank_transfer"
      ) &&
      !paymentReference.trim()
    ) {
      setError(
        "Payment reference is required for Mobile Money and Bank Transfer.",
      );
      return;
    }

    setBusy(true);
    setError("");

    try {
      await payPayroll(
        payTarget.id,
        {
          payment_method:
            paymentMethod,

          payment_reference:
            paymentReference.trim() ||
            undefined,

          payment_date:
            paymentDate,
        },
      );

      setPayTarget(null);

      setSuccess(
        `${payTarget.payroll_code} payment recorded successfully.`,
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
    payroll: Payroll,
  ) {
    try {
      setViewing(
        await getPayroll(
          payroll.id,
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
      await cancelPayroll(
        cancelTarget.id,
        cancellationReason.trim(),
      );

      setCancelTarget(null);
      setCancellationReason("");

      setSuccess(
        "Payroll cancelled successfully.",
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
            Payroll
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-700">
            Prepare monthly salaries,
            process Payroll and record
            employee payments.
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
            New Payroll
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Gross Payroll"
          value={formatMoney(
            summary.gross_payroll,
            summary.currency,
          )}
          icon={
            <CircleDollarSign
              size={19}
            />
          }
        />

        <Metric
          title="Net Payroll"
          value={formatMoney(
            summary.net_payroll,
            summary.currency,
          )}
          icon={
            <Calculator
              size={19}
            />
          }
          green
        />

        <Metric
          title="Total Paid"
          value={formatMoney(
            summary.total_paid,
            summary.currency,
          )}
          icon={
            <Banknote
              size={19}
            />
          }
          green
        />

        <Metric
          title="Deductions"
          value={formatMoney(
            summary.total_deductions,
            summary.currency,
          )}
          icon={
            <WalletCards
              size={19}
            />
          }
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <MiniMetric
          title="Total Records"
          value={String(
            summary.total_records,
          )}
        />

        <MiniMetric
          title="Draft"
          value={String(
            summary.draft_records,
          )}
        />

        <MiniMetric
          title="Processed"
          value={String(
            summary.processed_records,
          )}
        />

        <MiniMetric
          title="Paid"
          value={String(
            summary.paid_records,
          )}
        />
      </div>

      <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1fr_170px_170px_240px_auto_auto]">
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
              placeholder="Search Payroll, employee or payment reference..."
              className="h-11 w-full rounded-lg border border-slate-400 bg-white pl-9 pr-3 text-sm font-medium outline-none placeholder:text-slate-600 focus:border-[#075b38]"
            />
          </div>

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

            <option value="draft">
              Draft
            </option>

            <option value="processed">
              Processed
            </option>

            <option value="paid">
              Paid
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>

          <input
            type="month"
            value={monthFilter}
            onChange={(event) =>
              setMonthFilter(
                event.target.value,
              )
            }
            className={inputClass}
          />

          <select
            value={
              employeeFilter
            }
            onChange={(event) =>
              setEmployeeFilter(
                event.target.value,
              )
            }
            className={inputClass}
          >
            <option value="">
              All Employees
            </option>

            {employees.map(
              (employee) => (
                <option
                  key={employee.id}
                  value={employee.id}
                >
                  {employee.name}
                  {employee.role
                    ? ` — ${label(
                        employee.role,
                      )}`
                    : ""}
                </option>
              ),
            )}
          </select>

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
                  Payroll
                </th>

                <th className="px-4 py-4">
                  Employee
                </th>

                <th className="px-4 py-4">
                  Month
                </th>

                <th className="px-4 py-4">
                  Basic
                </th>

                <th className="px-4 py-4">
                  Allowances
                </th>

                <th className="px-4 py-4">
                  Gross
                </th>

                <th className="px-4 py-4">
                  Deductions
                </th>

                <th className="px-4 py-4">
                  Net Salary
                </th>

                <th className="px-4 py-4">
                  Payment
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
                  (payroll) => (
                    <tr
                      key={payroll.id}
                      className="border-b border-slate-200 text-sm hover:bg-[#fffdf8]"
                    >
                      <td className="px-4 py-4">
                        <p className="font-extrabold text-[#80570f]">
                          {
                            payroll.payroll_code
                          }
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-bold">
                          {
                            payroll.employee_name
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {payroll.employee_role
                            ? label(
                                payroll.employee_role,
                              )
                            : "—"}
                        </p>
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {formatMonth(
                          payroll.payroll_month,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {formatMoney(
                          payroll.basic_salary,
                          payroll.currency,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {formatMoney(
                          payroll.allowances,
                          payroll.currency,
                        )}
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {formatMoney(
                          payroll.gross_salary,
                          payroll.currency,
                        )}
                      </td>

                      <td className="px-4 py-4 text-red-700">
                        {formatMoney(
                          payroll.deductions,
                          payroll.currency,
                        )}
                      </td>

                      <td className="px-4 py-4 font-extrabold text-[#075b38]">
                        {formatMoney(
                          payroll.net_salary,
                          payroll.currency,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {payroll.status ===
                        "paid" ? (
                          <>
                            <p className="font-bold">
                              {label(
                                payroll.payment_method ??
                                  "cash",
                              )}
                            </p>

                            <p className="mt-1 text-xs text-slate-600">
                              {
                                payroll.payment_date
                              }
                            </p>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          status={
                            payroll.status
                          }
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-2">
                          <IconButton
                            title="View"
                            onClick={() =>
                              void openView(
                                payroll,
                              )
                            }
                          >
                            <Eye size={15} />
                          </IconButton>

                          {canManage &&
                            payroll.status ===
                              "draft" && (
                              <>
                                <IconButton
                                  title="Edit"
                                  onClick={() =>
                                    openEdit(
                                      payroll,
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
                                    void markProcessed(
                                      payroll,
                                    )
                                  }
                                  className="h-9 rounded-lg bg-[#075b38] px-3 text-xs font-bold text-white disabled:opacity-50"
                                >
                                  Process
                                </button>
                              </>
                            )}

                          {canManage &&
                            payroll.status ===
                              "processed" && (
                              <button
                                type="button"
                                onClick={() =>
                                  openPay(
                                    payroll,
                                  )
                                }
                                className="h-9 rounded-lg bg-[#075b38] px-3 text-xs font-bold text-white"
                              >
                                Pay
                              </button>
                            )}

                          {canManage &&
                            (
                              payroll.status ===
                                "draft" ||
                              payroll.status ===
                                "processed"
                            ) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCancelTarget(
                                    payroll,
                                  );
                                  setCancellationReason(
                                    "",
                                  );
                                }}
                                className="h-9 rounded-lg border border-red-300 px-3 text-xs font-bold text-red-800 hover:bg-red-50"
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
                    colSpan={11}
                    className="py-16 text-center"
                  >
                    <UserRound
                      size={40}
                      className="mx-auto text-slate-400"
                    />

                    <p className="mt-3 font-bold">
                      No Payroll records
                      found.
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
            title="New Payroll"
            subtitle="Create a monthly salary record. Gross and Net Salary are calculated automatically."
            close={() =>
              setCreateOpen(false)
            }
          >
            <PayrollForm
              employees={employees}
              employeeId={employeeId}
              setEmployeeId={setEmployeeId}
              payrollMonth={payrollMonth}
              setPayrollMonth={setPayrollMonth}
              basicSalary={basicSalary}
              setBasicSalary={setBasicSalary}
              allowances={allowances}
              setAllowances={setAllowances}
              deductions={deductions}
              setDeductions={setDeductions}
              notes={notes}
              setNotes={setNotes}
            />

            {salaryPreview && (
              <SalaryPreview
                basic={
                  salaryPreview.basic
                }
                allowance={
                  salaryPreview.allowance
                }
                gross={
                  salaryPreview.gross
                }
                deduction={
                  salaryPreview.deduction
                }
                net={
                  salaryPreview.net
                }
              />
            )}

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
            title={`Edit ${editing.payroll_code}`}
            subtitle="Only draft Payroll records can be edited."
            close={() =>
              setEditing(null)
            }
          >
            <PayrollForm
              employees={employees}
              employeeId={employeeId}
              setEmployeeId={setEmployeeId}
              payrollMonth={payrollMonth}
              setPayrollMonth={setPayrollMonth}
              basicSalary={basicSalary}
              setBasicSalary={setBasicSalary}
              allowances={allowances}
              setAllowances={setAllowances}
              deductions={deductions}
              setDeductions={setDeductions}
              notes={notes}
              setNotes={setNotes}
            />

            {salaryPreview && (
              <SalaryPreview
                basic={
                  salaryPreview.basic
                }
                allowance={
                  salaryPreview.allowance
                }
                gross={
                  salaryPreview.gross
                }
                deduction={
                  salaryPreview.deduction
                }
                net={
                  salaryPreview.net
                }
              />
            )}

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

      {payTarget && (
        <Modal>
          <ModalCard
            title={`Pay ${payTarget.payroll_code}`}
            subtitle={`Record salary payment for ${payTarget.employee_name}.`}
            close={() =>
              setPayTarget(null)
            }
          >
            <div className="grid gap-3 rounded-lg border border-[#d9c9ae] bg-[#fffaf2] p-4 sm:grid-cols-3">
              <Info
                title="Employee"
                value={
                  payTarget.employee_name
                }
              />

              <Info
                title="Month"
                value={formatMonth(
                  payTarget.payroll_month,
                )}
              />

              <Info
                title="Net Salary"
                value={formatMoney(
                  payTarget.net_salary,
                  payTarget.currency,
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Payment Method">
                <select
                  value={
                    paymentMethod
                  }
                  onChange={(event) => {
                    const value =
                      event.target
                        .value as PayrollPaymentMethod;

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
                </select>
              </Field>

              <Field label="Payment Date">
                <input
                  type="date"
                  max={todayInput()}
                  value={paymentDate}
                  onChange={(event) =>
                    setPaymentDate(
                      event.target.value,
                    )
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <Field
              label={
                paymentMethod ===
                  "cash"
                  ? "Payment Reference"
                  : "Payment Reference *"
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
                      : "Optional"
                }
                className={inputClass}
              />
            </Field>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-bold text-emerald-950">
                This action marks the
                Payroll as Paid.
              </p>

              <p className="mt-1 text-xs font-medium text-emerald-800">
                Paid Payroll records
                cannot be edited or
                cancelled directly.
              </p>
            </div>

            <Actions
              busy={busy}
              cancel={() =>
                setPayTarget(null)
              }
              submit={() =>
                void submitPay()
              }
              text="Record Payment"
            />
          </ModalCard>
        </Modal>
      )}

      {cancelTarget && (
        <Modal>
          <ModalCard
            title={`Cancel ${cancelTarget.payroll_code}`}
            subtitle="The Payroll stays in history. A corrected Payroll can then be created for the employee."
            close={() =>
              setCancelTarget(null)
            }
          >
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
                placeholder="Explain why this Payroll record is being cancelled..."
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
                Keep Payroll
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
                  : "Cancel Payroll"}
              </button>
            </div>
          </ModalCard>
        </Modal>
      )}

      {viewing && (
        <Modal>
          <ModalCard
            title={
              viewing.payroll_code
            }
            subtitle="Payroll salary, processing, payment and accountability details."
            close={() =>
              setViewing(null)
            }
          >
            <div className="grid gap-x-6 md:grid-cols-3">
              <Detail
                title="Employee"
                value={
                  viewing.employee_name
                }
              />

              <Detail
                title="Role"
                value={
                  viewing.employee_role
                    ? label(
                        viewing.employee_role,
                      )
                    : "—"
                }
              />

              <Detail
                title="Month"
                value={formatMonth(
                  viewing.payroll_month,
                )}
              />

              <Detail
                title="Basic Salary"
                value={formatMoney(
                  viewing.basic_salary,
                  viewing.currency,
                )}
              />

              <Detail
                title="Allowances"
                value={formatMoney(
                  viewing.allowances,
                  viewing.currency,
                )}
              />

              <Detail
                title="Gross Salary"
                value={formatMoney(
                  viewing.gross_salary,
                  viewing.currency,
                )}
              />

              <Detail
                title="Deductions"
                value={formatMoney(
                  viewing.deductions,
                  viewing.currency,
                )}
              />

              <Detail
                title="Net Salary"
                value={formatMoney(
                  viewing.net_salary,
                  viewing.currency,
                )}
              />

              <Detail
                title="Status"
                value={label(
                  viewing.status,
                )}
              />

              <Detail
                title="Processed By"
                value={
                  viewing.processor
                    ?.name ??
                  "—"
                }
              />

              <Detail
                title="Processed At"
                value={formatDateTime(
                  viewing.processed_at,
                )}
              />

              <Detail
                title="Paid By"
                value={
                  viewing.payer
                    ?.name ??
                  "—"
                }
              />

              <Detail
                title="Payment Method"
                value={
                  viewing.payment_method
                    ? label(
                        viewing.payment_method,
                      )
                    : "—"
                }
              />

              <Detail
                title="Payment Date"
                value={
                  viewing.payment_date ??
                  "—"
                }
              />

              <Detail
                title="Payment Reference"
                value={
                  viewing.payment_reference ??
                  "—"
                }
              />
            </div>

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

function PayrollForm({
  employees,
  employeeId,
  setEmployeeId,
  payrollMonth,
  setPayrollMonth,
  basicSalary,
  setBasicSalary,
  allowances,
  setAllowances,
  deductions,
  setDeductions,
  notes,
  setNotes,
}: {
  employees: PayrollEmployee[];

  employeeId: string;
  setEmployeeId: (
    value: string,
  ) => void;

  payrollMonth: string;
  setPayrollMonth: (
    value: string,
  ) => void;

  basicSalary: string;
  setBasicSalary: (
    value: string,
  ) => void;

  allowances: string;
  setAllowances: (
    value: string,
  ) => void;

  deductions: string;
  setDeductions: (
    value: string,
  ) => void;

  notes: string;
  setNotes: (
    value: string,
  ) => void;
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Employee">
          <select
            value={employeeId}
            onChange={(event) =>
              setEmployeeId(
                event.target.value,
              )
            }
            className={inputClass}
          >
            <option value="">
              Select Employee
            </option>

            {employees.map(
              (employee) => (
                <option
                  key={employee.id}
                  value={employee.id}
                >
                  {employee.name}
                  {employee.role
                    ? ` — ${label(
                        employee.role,
                      )}`
                    : ""}
                </option>
              ),
            )}
          </select>
        </Field>

        <Field label="Payroll Month">
          <input
            type="month"
            value={payrollMonth}
            onChange={(event) =>
              setPayrollMonth(
                event.target.value,
              )
            }
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Basic Salary (RWF)">
          <input
            type="number"
            min="1"
            step="1"
            value={basicSalary}
            onChange={(event) =>
              setBasicSalary(
                event.target.value,
              )
            }
            placeholder="0"
            className={inputClass}
          />
        </Field>

        <Field label="Allowances (RWF)">
          <input
            type="number"
            min="0"
            step="1"
            value={allowances}
            onChange={(event) =>
              setAllowances(
                event.target.value,
              )
            }
            className={inputClass}
          />
        </Field>

        <Field label="Deductions (RWF)">
          <input
            type="number"
            min="0"
            step="1"
            value={deductions}
            onChange={(event) =>
              setDeductions(
                event.target.value,
              )
            }
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Notes">
        <textarea
          value={notes}
          onChange={(event) =>
            setNotes(
              event.target.value,
            )
          }
          placeholder="Optional Payroll notes..."
          className={textareaClass}
        />
      </Field>
    </>
  );
}

function SalaryPreview({
  basic,
  allowance,
  gross,
  deduction,
  net,
}: {
  basic: number;
  allowance: number;
  gross: number;
  deduction: number;
  net: number;
}) {
  return (
    <div className="rounded-lg border border-[#d9c9ae] bg-[#fffaf2] p-4">
      <p className="mb-3 text-xs font-extrabold uppercase text-[#80570f]">
        Salary Preview
      </p>

      <div className="grid gap-3 sm:grid-cols-5">
        <Info
          title="Basic"
          value={formatMoney(
            basic,
          )}
        />

        <Info
          title="Allowances"
          value={formatMoney(
            allowance,
          )}
        />

        <Info
          title="Gross"
          value={formatMoney(
            gross,
          )}
        />

        <Info
          title="Deductions"
          value={formatMoney(
            deduction,
          )}
        />

        <Info
          title="Net Salary"
          value={formatMoney(
            net,
          )}
        />
      </div>

      <p className="mt-3 text-xs font-medium text-slate-600">
        Preview only. The backend
        recalculates Gross and Net
        Salary before saving.
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: PayrollStatus;
}) {
  const styles: Record<
    PayrollStatus,
    string
  > = {
    draft:
      "bg-slate-100 text-slate-800",

    processed:
      "bg-amber-100 text-amber-900",

    paid:
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
        {total} payroll records · Page{" "}
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
            setPage(page + 1)
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

function formatMonth(
  value: string,
) {
  const [year, month] =
    value.split("-");

  if (
    !year ||
    !month
  ) {
    return value;
  }

  const date =
    new Date(
      Number(year),
      Number(month) - 1,
      1,
    );

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "long",
      year: "numeric",
    },
  ).format(date);
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

function currentMonth() {
  const date =
    new Date();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(2, "0");

  return `${date.getFullYear()}-${month}`;
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
