"use client";

import {
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  LoaderCircle,
  Plus,
  RefreshCw,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useCurrentUser,
} from "@/components/auth/current-user-context";

import {
  approvePettyCashRequest,
  cancelPettyCashRequest,
  createPettyCashRequest,
  getPettyCashRequests,
  getPettyCashSummary,
  rejectPettyCashRequest,
} from "@/services/petty-cash-service";

import type {
  PettyCashRequest,
  PettyCashRequestStatus,
  PettyCashSummary,
} from "@/types/petty-cash";

const emptySummary:
  PettyCashSummary = {
    currency: "RWF",
    balance: "0.00",
    total_requests: 0,
    pending_requests: 0,
    approved_requests: 0,
    approved_amount: "0.00",
    rejected_requests: 0,
    cancelled_requests: 0,
  };

export default function PettyCashManagement() {
  const {
    user,
    loading:
      userLoading,
  } =
    useCurrentUser();

  const [
    items,
    setItems,
  ] =
    useState<
      PettyCashRequest[]
    >([]);

  const [
    summary,
    setSummary,
  ] =
    useState(
      emptySummary,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    busy,
    setBusy,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  const [
    status,
    setStatus,
  ] =
    useState("");

  const [
    page,
    setPage,
  ] =
    useState(1);

  const [
    lastPage,
    setLastPage,
  ] =
    useState(1);

  const [
    total,
    setTotal,
  ] =
    useState(0);

  const [
    requestOpen,
    setRequestOpen,
  ] =
    useState(false);

  const [
    amount,
    setAmount,
  ] =
    useState("");

  const [
    purpose,
    setPurpose,
  ] =
    useState("");

  const [
    rejectTarget,
    setRejectTarget,
  ] =
    useState<
      PettyCashRequest | null
    >(null);

  const [
    cancelTarget,
    setCancelTarget,
  ] =
    useState<
      PettyCashRequest | null
    >(null);

  const [
    reason,
    setReason,
  ] =
    useState("");

  const isAdmin =
    user?.role ===
    "admin";

  const isAccountant =
    user?.role ===
    "accountant";

  const load =
    useCallback(
      async () => {
        if (
          userLoading ||
          !user
        ) {
          return;
        }

        setLoading(
          true,
        );

        setError("");

        try {
          const [
            requestResult,
            summaryResult,
          ] =
            await Promise.all([
              getPettyCashRequests({
                status:
                  status
                    ? (
                        status as PettyCashRequestStatus
                      )
                    : undefined,

                page,
                per_page: 15,
              }),

              getPettyCashSummary(),
            ]);

          setItems(
            requestResult.items,
          );

          setSummary(
            summaryResult,
          );

          setTotal(
            requestResult
              .pagination
              .total,
          );

          setLastPage(
            Math.max(
              requestResult
                .pagination
                .last_page,
              1,
            ),
          );
        } catch (
          requestError
        ) {
          setError(
            message(
              requestError,
            ),
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [
        page,
        status,
        user,
        userLoading,
      ],
    );

  useEffect(() => {
    void load();
  }, [load]);

  function openRequest() {
    setAmount("");
    setPurpose("");
    setError("");
    setSuccess("");
    setRequestOpen(
      true,
    );
  }

  async function submitRequest(
    event: FormEvent,
  ) {
    event.preventDefault();

    const value =
      Number(amount);

    if (
      !Number.isFinite(
        value,
      ) ||
      value <= 0
    ) {
      setError(
        "Budget amount must be greater than zero.",
      );

      return;
    }

    if (
      purpose
        .trim()
        .length < 3
    ) {
      setError(
        "Purpose is required.",
      );

      return;
    }

    setBusy(true);
    setError("");

    try {
      await createPettyCashRequest(
        {
          amount:
            value,

          purpose:
            purpose.trim(),
        },
      );

      setRequestOpen(
        false,
      );

      setSuccess(
        "Petty Cash budget request submitted successfully.",
      );

      setPage(1);

      await load();
    } catch (
      requestError
    ) {
      setError(
        message(
          requestError,
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  async function approve(
    item:
      PettyCashRequest,
  ) {
    const confirmed =
      window.confirm(
        `Approve ${item.request_code} for ${formatMoney(
          item.amount,
        )}? The Accountant's Petty Cash balance will increase immediately.`,
      );

    if (!confirmed) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await approvePettyCashRequest(
        item.id,
      );

      setSuccess(
        `${item.request_code} approved. Petty Cash balance has been credited.`,
      );

      await load();
    } catch (
      requestError
    ) {
      setError(
        message(
          requestError,
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitReject() {
    if (!rejectTarget) {
      return;
    }

    if (
      reason.trim().length <
      3
    ) {
      setError(
        "Rejection reason must contain at least 3 characters.",
      );

      return;
    }

    setBusy(true);
    setError("");

    try {
      await rejectPettyCashRequest(
        rejectTarget.id,
        reason.trim(),
      );

      setRejectTarget(
        null,
      );

      setReason("");

      setSuccess(
        "Petty Cash request rejected successfully.",
      );

      await load();
    } catch (
      requestError
    ) {
      setError(
        message(
          requestError,
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitCancel() {
    if (!cancelTarget) {
      return;
    }

    if (
      reason.trim().length <
      3
    ) {
      setError(
        "Cancellation reason must contain at least 3 characters.",
      );

      return;
    }

    setBusy(true);
    setError("");

    try {
      await cancelPettyCashRequest(
        cancelTarget.id,
        reason.trim(),
      );

      setCancelTarget(
        null,
      );

      setReason("");

      setSuccess(
        "Petty Cash request cancelled successfully.",
      );

      await load();
    } catch (
      requestError
    ) {
      setError(
        message(
          requestError,
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  if (
    !userLoading &&
    !isAdmin &&
    !isAccountant
  ) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-800">
        You do not have permission to access Petty Cash.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950">
            Petty Cash
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-600">
            {isAdmin
              ? "Review Accountant Petty Cash budget requests and control approved funding."
              : "Request operational budget and monitor your available Petty Cash balance."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              void load()
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 hover:bg-slate-50"
          >
            <RefreshCw
              size={16}
            />
            Refresh
          </button>

          {isAccountant && (
            <button
              type="button"
              onClick={
                openRequest
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white hover:bg-[#064a2f]"
            >
              <Plus
                size={17}
              />

              Request Budget
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title={
            isAdmin
              ? "Total Petty Cash Balance"
              : "Available Balance"
          }
          value={formatMoney(
            summary.balance,
          )}
          icon={
            CircleDollarSign
          }
          green
        />

        <SummaryCard
          title="Pending Requests"
          value={String(
            summary.pending_requests,
          )}
          icon={
            Clock3
          }
        />

        <SummaryCard
          title="Approved Funding"
          value={formatMoney(
            summary.approved_amount,
          )}
          icon={
            CheckCircle2
          }
          green
        />

        <SummaryCard
          title="Total Requests"
          value={String(
            summary.total_requests,
          )}
          icon={
            Banknote
          }
        />
      </div>

      {isAccountant && (
        <div className="rounded-xl border border-[#e5ded4] bg-[#fffaf2] p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-[#075b38]"
            />

            <div>
              <p className="text-sm font-bold text-slate-950">
                Budget approval required
              </p>

              <p className="mt-1 text-xs font-medium leading-5 text-slate-600">
                A requested amount does not affect your balance until an Admin approves it.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <Notice
          error
          text={error}
        />
      )}

      {success && (
        <Notice
          text={success}
        />
      )}

      <section className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label className="mb-2 block text-xs font-bold text-slate-700">
              Request Status
            </label>

            <select
              value={status}
              onChange={(event) => {
                setStatus(
                  event.target
                    .value,
                );

                setPage(1);
              }}
              className="h-11 min-w-52 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900"
            >
              <option value="">
                All Requests
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
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[#e5ded4] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead className="bg-[#fcfbf9]">
              <tr className="border-b text-left text-xs font-extrabold uppercase text-slate-700">
                <th className="px-4 py-4">
                  Request
                </th>

                {isAdmin && (
                  <th className="px-4 py-4">
                    Accountant
                  </th>
                )}

                <th className="px-4 py-4">
                  Amount
                </th>

                <th className="px-4 py-4">
                  Purpose
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
                    colSpan={
                      isAdmin
                        ? 7
                        : 6
                    }
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
                  (item) => (
                    <tr
                      key={
                        item.id
                      }
                      className="border-b border-slate-100 text-sm hover:bg-[#fffdf8]"
                    >
                      <td className="px-4 py-4">
                        <p className="font-extrabold text-[#80570f]">
                          {
                            item.request_code
                          }
                        </p>
                      </td>

                      {isAdmin && (
                        <td className="px-4 py-4">
                          <p className="font-bold text-slate-950">
                            {item.requester
                              ?.name ??
                              "—"}
                          </p>
                        </td>
                      )}

                      <td className="px-4 py-4 font-extrabold text-slate-950">
                        {formatMoney(
                          item.amount,
                        )}
                      </td>

                      <td className="max-w-[320px] px-4 py-4 text-slate-700">
                        <p className="line-clamp-2">
                          {
                            item.purpose
                          }
                        </p>
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {formatDate(
                          item.created_at,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          status={
                            item.status
                          }
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-center gap-2">
                          {isAdmin &&
                            item.status ===
                              "pending" && (
                              <>
                                <button
                                  type="button"
                                  disabled={
                                    busy
                                  }
                                  onClick={() =>
                                    void approve(
                                      item,
                                    )
                                  }
                                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-700 px-3 text-xs font-bold text-white disabled:opacity-50"
                                >
                                  <CheckCircle2
                                    size={14}
                                  />
                                  Approve
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    busy
                                  }
                                  onClick={() => {
                                    setRejectTarget(
                                      item,
                                    );

                                    setReason(
                                      "",
                                    );
                                  }}
                                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 text-xs font-bold text-red-700 hover:bg-red-50"
                                >
                                  <XCircle
                                    size={14}
                                  />
                                  Reject
                                </button>
                              </>
                            )}

                          {isAccountant &&
                            item.status ===
                              "pending" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCancelTarget(
                                    item,
                                  );

                                  setReason(
                                    "",
                                  );
                                }}
                                className="h-9 rounded-lg border border-red-300 bg-white px-3 text-xs font-bold text-red-700 hover:bg-red-50"
                              >
                                Cancel Request
                              </button>
                            )}

                          {item.status ===
                            "approved" && (
                            <span className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 text-xs font-bold text-emerald-800">
                              <CheckCircle2
                                size={14}
                              />

                              Credited
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td
                    colSpan={
                      isAdmin
                        ? 7
                        : 6
                    }
                    className="py-16 text-center"
                  >
                    <Banknote
                      size={40}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-bold text-slate-800">
                      No Petty Cash requests found.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t px-5 py-4">
          <p className="text-sm font-medium text-slate-600">
            {total} request
            {total === 1
              ? ""
              : "s"}{" "}
            · Page{" "}
            <b>{page}</b> of{" "}
            <b>{lastPage}</b>
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={
                page <= 1
              }
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
              <ChevronLeft
                size={17}
              />
            </button>

            <button
              type="button"
              disabled={
                page >=
                lastPage
              }
              onClick={() =>
                setPage(
                  page + 1,
                )
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 disabled:opacity-40"
            >
              <ChevronRight
                size={17}
              />
            </button>
          </div>
        </div>
      </section>

      {requestOpen && (
        <Modal>
          <ModalCard
            title="Request Petty Cash Budget"
            subtitle="Submit an operational budget request for Admin approval."
            close={() =>
              setRequestOpen(
                false,
              )
            }
          >
            <form
              onSubmit={
                submitRequest
              }
              className="space-y-4"
            >
              <Field
                label="Requested Amount (RWF)"
              >
                <input
                  autoFocus
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={
                    amount
                  }
                  onChange={(
                    event,
                  ) =>
                    setAmount(
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="Example: 500000"
                  className={
                    inputClass
                  }
                />
              </Field>

              <Field label="Purpose">
                <textarea
                  required
                  rows={4}
                  value={
                    purpose
                  }
                  onChange={(
                    event,
                  ) =>
                    setPurpose(
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="Explain why this Petty Cash budget is needed..."
                  className={
                    textareaClass
                  }
                />
              </Field>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">
                  Your balance will not change until Admin approves this request.
                </p>
              </div>

              <ModalActions
                busy={
                  busy
                }
                cancel={() =>
                  setRequestOpen(
                    false,
                  )
                }
                text="Submit Request"
              />
            </form>
          </ModalCard>
        </Modal>
      )}

      {rejectTarget && (
        <ReasonModal
          title={`Reject ${rejectTarget.request_code}`}
          subtitle="Explain why this Petty Cash request is being rejected."
          value={reason}
          setValue={
            setReason
          }
          busy={busy}
          close={() =>
            setRejectTarget(
              null,
            )
          }
          submit={() =>
            void submitReject()
          }
          submitText="Reject Request"
        />
      )}

      {cancelTarget && (
        <ReasonModal
          title={`Cancel ${cancelTarget.request_code}`}
          subtitle="Explain why you are cancelling this pending request."
          value={reason}
          setValue={
            setReason
          }
          busy={busy}
          close={() =>
            setCancelTarget(
              null,
            )
          }
          submit={() =>
            void submitCancel()
          }
          submitText="Cancel Request"
        />
      )}
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-lg border border-slate-400 bg-white px-3 text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-500 focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

const textareaClass =
  "w-full resize-none rounded-lg border border-slate-400 bg-white px-3 py-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-500 focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]";

function SummaryCard({
  title,
  value,
  icon: Icon,
  green = false,
}: {
  title: string;
  value: string;
  icon:
    typeof Banknote;
  green?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#e5ded4] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-extrabold uppercase text-slate-600">
          {title}
        </p>

        <Icon
          size={20}
          className={
            green
              ? "text-[#075b38]"
              : "text-[#80570f]"
          }
        />
      </div>

      <p
        className={[
          "mt-3 text-2xl font-extrabold",

          green
            ? "text-[#075b38]"
            : "text-slate-950",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status:
    PettyCashRequestStatus;
}) {
  const styles:
    Record<
      PettyCashRequestStatus,
      string
    > = {
      pending:
        "border-amber-200 bg-amber-50 text-amber-800",

      approved:
        "border-emerald-200 bg-emerald-50 text-emerald-800",

      rejected:
        "border-red-200 bg-red-50 text-red-700",

      cancelled:
        "border-slate-300 bg-slate-100 text-slate-700",
    };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-extrabold capitalize ${styles[status]}`}
    >
      {status}
    </span>
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
      className={[
        "rounded-lg border px-4 py-3 text-sm font-semibold",

        error
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800",
      ].join(" ")}
    >
      {text}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children:
    React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-900">
        {label}
      </label>

      {children}
    </div>
  );
}

function Modal({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]">
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
  children:
    React.ReactNode;
}) {
  return (
    <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-950">
            {title}
          </h2>

          <p className="mt-1 text-sm font-medium text-slate-600">
            {subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={close}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
        >
          <X
            size={19}
          />
        </button>
      </div>

      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

function ModalActions({
  busy,
  cancel,
  text,
}: {
  busy: boolean;
  cancel: () => void;
  text: string;
}) {
  return (
    <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
      <button
        type="button"
        disabled={busy}
        onClick={cancel}
        className="h-10 rounded-lg border border-slate-400 bg-white px-4 text-sm font-bold text-slate-900 disabled:opacity-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={busy}
        className="h-10 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white disabled:opacity-50"
      >
        {busy
          ? "Submitting..."
          : text}
      </button>
    </div>
  );
}

function ReasonModal({
  title,
  subtitle,
  value,
  setValue,
  busy,
  close,
  submit,
  submitText,
}: {
  title: string;
  subtitle: string;
  value: string;
  setValue:
    (value: string) =>
      void;
  busy: boolean;
  close: () => void;
  submit: () => void;
  submitText: string;
}) {
  return (
    <Modal>
      <ModalCard
        title={title}
        subtitle={subtitle}
        close={close}
      >
        <div className="space-y-4">
          <Field label="Reason">
            <textarea
              autoFocus
              rows={4}
              value={
                value
              }
              onChange={(
                event,
              ) =>
                setValue(
                  event
                    .target
                    .value,
                )
              }
              placeholder="Enter a clear reason..."
              className={
                textareaClass
              }
            />
          </Field>

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              disabled={busy}
              onClick={close}
              className="h-10 rounded-lg border border-slate-400 bg-white px-4 text-sm font-bold text-slate-900"
            >
              Back
            </button>

            <button
              type="button"
              disabled={
                busy ||
                value
                  .trim()
                  .length < 3
              }
              onClick={
                submit
              }
              className="h-10 rounded-lg bg-red-700 px-5 text-sm font-bold text-white disabled:opacity-50"
            >
              {busy
                ? "Saving..."
                : submitText}
            </button>
          </div>
        </div>
      </ModalCard>
    </Modal>
  );
}

function formatMoney(
  value:
    | string
    | number,
) {
  const amount =
    Number(value);

  return `${new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits:
        0,
    },
  ).format(
    Number.isFinite(amount)
      ? amount
      : 0,
  )} RWF`;
}

function formatDate(
  value: string,
) {
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
      dateStyle:
        "medium",
    },
  ).format(date);
}

function message(
  error: unknown,
) {
  return error instanceof Error
    ? error.message
    : "Something went wrong.";
}
