"use client";

import {
  CheckCircle2,
  Clock3,
  Eye,
  LoaderCircle,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  approveApproval,
  cancelApproval,
  getApproval,
  getApprovalRole,
  getApprovals,
  getApprovalSummary,
  rejectApproval,
} from "@/services/approval-service";

import type {
  ApprovalRequest,
  ApprovalStatus,
  ApprovalSummary,
  DashboardRole,
} from "@/types/approval";

const inputClass =
  "h-11 w-full rounded-lg border border-slate-400 bg-white px-3 text-sm font-medium text-slate-950 outline-none focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

const textareaClass =
  "min-h-28 w-full rounded-lg border border-slate-400 bg-white px-3 py-2.5 text-sm font-medium text-slate-950 outline-none focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

const emptySummary: ApprovalSummary = {
  total_requests: 0,
  pending_requests: 0,
  approved_requests: 0,
  rejected_requests: 0,
  cancelled_requests: 0,
  pending_amount: "0.00",
  approved_unapplied_amount: "0.00",
  currency: "RWF",
};

export default function ApprovalManagement() {
  const [items, setItems] =
    useState<ApprovalRequest[]>([]);

  const [summary, setSummary] =
    useState<ApprovalSummary>(
      emptySummary,
    );

  const [role, setRole] =
    useState<DashboardRole>("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [moduleFilter, setModuleFilter] =
    useState("");

  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");

  const [filters, setFilters] =
    useState({
      search: "",
      status: "",
      module: "",
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

  const [viewing, setViewing] =
    useState<ApprovalRequest | null>(
      null,
    );

  const [reviewTarget, setReviewTarget] =
    useState<ApprovalRequest | null>(
      null,
    );

  const [reviewMode, setReviewMode] =
    useState<
      "approve" | "reject" | null
    >(null);

  const [reviewNote, setReviewNote] =
    useState("");

  const [cancelTarget, setCancelTarget] =
    useState<ApprovalRequest | null>(
      null,
    );

  const [
    cancellationReason,
    setCancellationReason,
  ] = useState("");

  const isAdmin =
    role === "admin";

  const load = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const [list, totals] =
          await Promise.all([
            getApprovals({
              search:
                filters.search ||
                undefined,

              status:
                filters.status
                  ? (
                      filters.status as ApprovalStatus
                    )
                  : undefined,

              module:
                filters.module ||
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

            getApprovalSummary(),
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
        setRole(
          await getApprovalRole(),
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

      status:
        statusFilter,

      module:
        moduleFilter,

      dateFrom,

      dateTo,
    });

    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("");
    setModuleFilter("");
    setDateFrom("");
    setDateTo("");

    setFilters({
      search: "",
      status: "",
      module: "",
      dateFrom: "",
      dateTo: "",
    });

    setPage(1);
  }

  async function openView(
    approval: ApprovalRequest,
  ) {
    try {
      setViewing(
        await getApproval(
          approval.id,
        ),
      );
    } catch (error) {
      setError(
        errorMessage(error),
      );
    }
  }

  function openReview(
    approval: ApprovalRequest,
    mode: "approve" | "reject",
  ) {
    setReviewTarget(approval);
    setReviewMode(mode);
    setReviewNote("");
    setError("");
  }

  async function submitReview() {
    if (
      !reviewTarget ||
      !reviewMode
    ) {
      return;
    }

    if (
      reviewMode === "reject" &&
      reviewNote.trim().length < 3
    ) {
      setError(
        "Rejection reason is required.",
      );

      return;
    }

    setBusy(true);
    setError("");

    try {
      if (
        reviewMode === "approve"
      ) {
        await approveApproval(
          reviewTarget.id,
          reviewNote.trim() ||
            undefined,
        );

        setSuccess(
          `${reviewTarget.approval_code} approved successfully.`,
        );
      } else {
        await rejectApproval(
          reviewTarget.id,
          reviewNote.trim(),
        );

        setSuccess(
          `${reviewTarget.approval_code} rejected.`,
        );
      }

      setReviewTarget(null);
      setReviewMode(null);
      setReviewNote("");

      await load();
    } catch (error) {
      setError(
        errorMessage(error),
      );
    } finally {
      setBusy(false);
    }
  }

  function openCancel(
    approval: ApprovalRequest,
  ) {
    setCancelTarget(approval);
    setCancellationReason("");
    setError("");
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
      await cancelApproval(
        cancelTarget.id,
        cancellationReason.trim(),
      );

      setSuccess(
        `${cancelTarget.approval_code} cancelled.`,
      );

      setCancelTarget(null);
      setCancellationReason("");

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
      <div>
        <h1 className="text-3xl font-extrabold">
          Approvals
        </h1>

        <p className="mt-1 text-sm font-medium text-slate-700">
          Review and control financial
          actions that require
          authorization before they are
          applied.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Pending"
          value={String(
            summary.pending_requests,
          )}
          icon={
            <Clock3 size={19} />
          }
        />

        <Metric
          title="Pending Amount"
          value={formatMoney(
            summary.pending_amount,
            summary.currency,
          )}
          icon={
            <ShieldCheck
              size={19}
            />
          }
        />

        <Metric
          title="Approved"
          value={String(
            summary.approved_requests,
          )}
          icon={
            <CheckCircle2
              size={19}
            />
          }
          green
        />

        <Metric
          title="Approved Not Yet Used"
          value={formatMoney(
            summary.approved_unapplied_amount,
            summary.currency,
          )}
          icon={
            <CheckCircle2
              size={19}
            />
          }
          green
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <MiniMetric
          title="Total Requests"
          value={String(
            summary.total_requests,
          )}
        />

        <MiniMetric
          title="Rejected"
          value={String(
            summary.rejected_requests,
          )}
        />

        <MiniMetric
          title="Cancelled"
          value={String(
            summary.cancelled_requests,
          )}
        />

        <MiniMetric
          title="Workflow"
          value="Payroll"
        />
      </div>

      <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1fr_180px_180px_160px_160px_auto_auto]">
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
              placeholder="Search approval, payroll or description..."
              className="h-11 w-full rounded-lg border border-slate-400 bg-white pl-9 pr-3 text-sm font-medium outline-none placeholder:text-slate-600 focus:border-[#075b38]"
            />
          </div>

          <select
            value={statusFilter}
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

            <option value="pending">
              Pending
            </option>

            <option value="approved">
              Approved
            </option>

            <option value="rejected">
              Rejected
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>

          <select
            value={moduleFilter}
            onChange={(event) =>
              setModuleFilter(
                event.target.value,
              )
            }
            className={inputClass}
          >
            <option value="">
              All Modules
            </option>

            <option value="payroll">
              Payroll
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
            onClick={applyFilters}
            className="h-11 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white"
          >
            Filter
          </button>

          <button
            type="button"
            onClick={resetFilters}
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
          <table className="w-full min-w-[1350px]">
            <thead className="bg-[#f6f1e8]">
              <tr className="border-b border-slate-300 text-left text-xs font-extrabold uppercase text-slate-800">
                <th className="px-4 py-4">
                  Approval
                </th>

                <th className="px-4 py-4">
                  Reference
                </th>

                <th className="px-4 py-4">
                  Module
                </th>

                <th className="px-4 py-4">
                  Request
                </th>

                <th className="px-4 py-4">
                  Amount
                </th>

                <th className="px-4 py-4">
                  Requested By
                </th>

                <th className="px-4 py-4">
                  Requested
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
                    colSpan={9}
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
                  (approval) => (
                    <tr
                      key={approval.id}
                      className="border-b border-slate-200 text-sm hover:bg-[#fffdf8]"
                    >
                      <td className="px-4 py-4">
                        <p className="font-extrabold text-[#80570f]">
                          {
                            approval.approval_code
                          }
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-bold">
                          {approval.reference_code ??
                            `#${approval.reference_id}`}
                        </p>

                        {approval.payroll && (
                          <p className="mt-1 text-xs text-slate-600">
                            {
                              approval.payroll
                                .employee_name
                            }
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {label(
                          approval.module,
                        )}
                      </td>

                      <td className="max-w-[300px] px-4 py-4">
                        <p className="font-bold">
                          {
                            approval.title
                          }
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-600">
                          {approval.description ??
                            "—"}
                        </p>
                      </td>

                      <td className="px-4 py-4 font-extrabold text-[#075b38]">
                        {approval.amount
                          ? formatMoney(
                              approval.amount,
                              approval.currency,
                            )
                          : "—"}
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {approval.requester
                          ?.name ??
                          "—"}
                      </td>

                      <td className="px-4 py-4">
                        {formatDateTime(
                          approval.requested_at,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          status={
                            approval.status
                          }
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-2">
                          <IconButton
                            title="View"
                            onClick={() =>
                              void openView(
                                approval,
                              )
                            }
                          >
                            <Eye size={15} />
                          </IconButton>

                          {isAdmin &&
                            approval.status ===
                              "pending" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    openReview(
                                      approval,
                                      "approve",
                                    )
                                  }
                                  className="h-9 rounded-lg bg-[#075b38] px-3 text-xs font-bold text-white"
                                >
                                  Approve
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openReview(
                                      approval,
                                      "reject",
                                    )
                                  }
                                  className="h-9 rounded-lg border border-red-300 px-3 text-xs font-bold text-red-800 hover:bg-red-50"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                          {approval.status ===
                            "pending" &&
                            (
                              isAdmin ||
                              approval.requester
                                ?.id
                            ) && (
                              <button
                                type="button"
                                onClick={() =>
                                  openCancel(
                                    approval,
                                  )
                                }
                                className="h-9 rounded-lg border border-slate-400 px-3 text-xs font-bold hover:bg-slate-100"
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
                    colSpan={9}
                    className="py-16 text-center"
                  >
                    <ShieldCheck
                      size={42}
                      className="mx-auto text-slate-400"
                    />

                    <p className="mt-3 font-bold">
                      No approval requests
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

      {reviewTarget &&
        reviewMode && (
          <Modal>
            <ModalCard
              title={
                reviewMode ===
                "approve"
                  ? `Approve ${reviewTarget.approval_code}`
                  : `Reject ${reviewTarget.approval_code}`
              }
              subtitle={
                reviewMode ===
                "approve"
                  ? "Confirm that this financial action is authorized."
                  : "Give a clear reason why this request is being rejected."
              }
              close={() => {
                setReviewTarget(
                  null,
                );
                setReviewMode(null);
              }}
            >
              <ApprovalSummaryCard
                approval={
                  reviewTarget
                }
              />

              <Field
                label={
                  reviewMode ===
                  "approve"
                    ? "Review Note"
                    : "Rejection Reason *"
                }
              >
                <textarea
                  value={reviewNote}
                  onChange={(
                    event,
                  ) =>
                    setReviewNote(
                      event.target
                        .value,
                    )
                  }
                  placeholder={
                    reviewMode ===
                    "approve"
                      ? "Optional approval note..."
                      : "Explain why this request is rejected..."
                  }
                  className={
                    textareaClass
                  }
                />
              </Field>

              <div className="flex justify-end gap-2 border-t border-slate-300 pt-4">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setReviewTarget(
                      null,
                    );
                    setReviewMode(
                      null,
                    );
                  }}
                  className="h-10 rounded-lg border border-slate-400 px-4 text-sm font-bold"
                >
                  Close
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void submitReview()
                  }
                  className={
                    reviewMode ===
                    "approve"
                      ? "h-10 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white disabled:opacity-50"
                      : "h-10 rounded-lg bg-red-700 px-5 text-sm font-bold text-white disabled:opacity-50"
                  }
                >
                  {busy
                    ? "Saving..."
                    : reviewMode ===
                        "approve"
                      ? "Approve Request"
                      : "Reject Request"}
                </button>
              </div>
            </ModalCard>
          </Modal>
        )}

      {cancelTarget && (
        <Modal>
          <ModalCard
            title={`Cancel ${cancelTarget.approval_code}`}
            subtitle="The request remains in the approval history."
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
                placeholder="Explain why this approval request is being cancelled..."
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
                  setCancelTarget(null)
                }
                className="h-10 rounded-lg border border-slate-400 px-4 text-sm font-bold"
              >
                Keep Request
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
                  : "Cancel Request"}
              </button>
            </div>
          </ModalCard>
        </Modal>
      )}

      {viewing && (
        <Modal>
          <ModalCard
            title={
              viewing.approval_code
            }
            subtitle="Approval request and authorization history."
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
                title="Module"
                value={label(
                  viewing.module,
                )}
              />

              <Detail
                title="Action"
                value={label(
                  viewing.action,
                )}
              />

              <Detail
                title="Reference"
                value={
                  viewing.reference_code ??
                  `#${viewing.reference_id}`
                }
              />

              <Detail
                title="Amount"
                value={
                  viewing.amount
                    ? formatMoney(
                        viewing.amount,
                        viewing.currency,
                      )
                    : "—"
                }
              />

              <Detail
                title="Requested By"
                value={
                  viewing.requester
                    ?.name ??
                  "—"
                }
              />

              <Detail
                title="Requested At"
                value={formatDateTime(
                  viewing.requested_at,
                )}
              />

              <Detail
                title="Reviewed By"
                value={
                  viewing.reviewer
                    ?.name ??
                  "—"
                }
              />

              <Detail
                title="Reviewed At"
                value={formatDateTime(
                  viewing.reviewed_at,
                )}
              />

              <Detail
                title="Applied By"
                value={
                  viewing.applier
                    ?.name ??
                  "—"
                }
              />

              <Detail
                title="Applied At"
                value={formatDateTime(
                  viewing.applied_at,
                )}
              />
            </div>

            <TextBlock
              title="Description"
              text={
                viewing.description ??
                "—"
              }
            />

            {viewing.request_note && (
              <TextBlock
                title="Request Note"
                text={
                  viewing.request_note
                }
              />
            )}

            {viewing.review_note && (
              <TextBlock
                title="Review Note"
                text={
                  viewing.review_note
                }
              />
            )}

            {viewing.payroll && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-extrabold uppercase text-emerald-800">
                  Payroll
                </p>

                <div className="mt-3 grid gap-4 sm:grid-cols-4">
                  <Info
                    title="Employee"
                    value={
                      viewing.payroll
                        .employee_name
                    }
                  />

                  <Info
                    title="Month"
                    value={
                      viewing.payroll
                        .payroll_month
                    }
                  />

                  <Info
                    title="Net Salary"
                    value={formatMoney(
                      viewing.payroll
                        .net_salary,
                      viewing.payroll
                        .currency,
                    )}
                  />

                  <Info
                    title="Payroll Status"
                    value={label(
                      viewing.payroll
                        .status,
                    )}
                  />
                </div>
              </div>
            )}
          </ModalCard>
        </Modal>
      )}
    </div>
  );
}

function ApprovalSummaryCard({
  approval,
}: {
  approval: ApprovalRequest;
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-[#d9c9ae] bg-[#fffaf2] p-4 sm:grid-cols-3">
      <Info
        title="Reference"
        value={
          approval.reference_code ??
          `#${approval.reference_id}`
        }
      />

      <Info
        title="Requested By"
        value={
          approval.requester?.name ??
          "—"
        }
      />

      <Info
        title="Amount"
        value={
          approval.amount
            ? formatMoney(
                approval.amount,
                approval.currency,
              )
            : "—"
        }
      />
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: ApprovalStatus;
}) {
  const styles: Record<
    ApprovalStatus,
    string
  > = {
    pending:
      "bg-amber-100 text-amber-900",

    approved:
      "bg-emerald-100 text-emerald-900",

    rejected:
      "bg-red-100 text-red-900",

    cancelled:
      "bg-slate-200 text-slate-800",
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
  value: string;
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
        {total} approval requests · Page{" "}
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

function formatMoney(
  value: string | number,
  currency = "RWF",
) {
  const number =
    Number(value);

  return `${new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 0,
    },
  ).format(
    Number.isFinite(number)
      ? number
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

function errorMessage(
  error: unknown,
) {
  return error instanceof Error
    ? error.message
    : "Something went wrong.";
}
