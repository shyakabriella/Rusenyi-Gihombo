"use client";

import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  CirclePlus,
  RefreshCw,
  Search,
  UserRound,
  X,
} from "lucide-react";

import {
  createWorker,
  getWorkers,
  updateWorkerStatus,
} from "@/services/worker-service";

import type {
  Worker,
} from "@/types/worker";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  national_id: "",
};

export default function WorkerManagement() {
  const [
    workers,
    setWorkers,
  ] =
    useState<Worker[]>(
      [],
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    modalOpen,
    setModalOpen,
  ] =
    useState(false);

  const [
    form,
    setForm,
  ] =
    useState(
      emptyForm,
    );

  const load =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const result =
            await getWorkers({
              search:
                search ||
                undefined,

              per_page: 100,
            });

          setWorkers(
            result.workers ??
              [],
          );
        } catch (
          requestError
        ) {
          setError(
            requestError
              instanceof Error
              ? requestError.message
              : "Unable to load Workers.",
          );
        } finally {
          setLoading(
            false,
          );
        }
      },
      [search],
    );

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          void load();
        },
        300,
      );

    return () =>
      window.clearTimeout(
        timer,
      );
  }, [load]);

  async function submit(
    event: FormEvent,
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await createWorker({
        name:
          form.name.trim(),

        phone:
          form.phone.trim() ||
          null,

        email:
          form.email.trim() ||
          null,

        national_id:
          form.national_id.trim() ||
          null,
      });

      setMessage(
        "Worker created successfully. No login account was created.",
      );

      setForm(
        emptyForm,
      );

      setModalOpen(
        false,
      );

      await load();
    } catch (
      requestError
    ) {
      setError(
        requestError
          instanceof Error
          ? requestError.message
          : "Unable to create Worker.",
      );
    } finally {
      setSaving(
        false,
      );
    }
  }

  return (
    <div className="space-y-5 p-5 lg:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">
            Workers
          </h2>

          <p className="mt-1 text-sm font-medium text-slate-700">
            Manage casual factory workers used for attendance and payroll.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setModalOpen(
              true,
            )
          }
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#075b38] px-4 text-sm font-semibold text-white transition hover:bg-[#064a2e]"
        >
          <CirclePlus size={18} />
          Add Worker
        </button>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-[#e5ded4] bg-[#faf7f1] p-4">
        <UserRound
          size={19}
          className="mt-0.5 shrink-0 text-[#075b38]"
        />

        <div>
          <p className="text-sm font-semibold text-slate-900">
            Casual workers do not need system accounts
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-600">
            Only the worker's name is required. Phone, email and National ID are optional.
          </p>
        </div>
      </div>

      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border border-[#e6dfd5] bg-white">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(
                event,
              ) =>
                setSearch(
                  event
                    .target
                    .value,
                )
              }
              placeholder="Search name, phone, email, National ID..."
              className="h-10 w-full rounded-lg border border-slate-300 pl-10 pr-3 text-sm outline-none focus:border-[#b88a45]"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              void load()
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold"
          >
            <RefreshCw
              size={16}
            />

            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-[#faf7f1] text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">
                  Worker
                </th>

                <th className="px-4 py-3">
                  Phone
                </th>

                <th className="px-4 py-3">
                  Email
                </th>

                <th className="px-4 py-3">
                  National ID
                </th>

                <th className="px-4 py-3">
                  Account
                </th>

                <th className="px-4 py-3">
                  Status
                </th>

                <th className="px-4 py-3">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-slate-500"
                  >
                    Loading Workers...
                  </td>
                </tr>
              ) : workers.length ? (
                workers.map(
                  (
                    worker,
                  ) => (
                    <tr
                      key={
                        worker.id
                      }
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-950">
                          {
                            worker.name
                          }
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {
                            worker.worker_code
                          }
                        </p>
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {worker.phone ??
                          "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {worker.email ??
                          "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {worker.national_id ??
                          "—"}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={
                            worker.has_account
                              ? "rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"
                              : "rounded-full bg-[#f6e7d2] px-2.5 py-1 text-xs font-semibold text-[#80570f]"
                          }
                        >
                          {worker.has_account
                            ? "Has account"
                            : "No login account"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={
                            worker.status ===
                            "active"
                              ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                              : "rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                          }
                        >
                          {
                            worker.status
                          }
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {worker.status ===
                        "active" ? (
                          <button
                            type="button"
                            onClick={async () => {
                              await updateWorkerStatus(
                                worker.id,
                                "inactive",
                              );

                              await load();
                            }}
                            className="text-xs font-semibold text-amber-700"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={async () => {
                              await updateWorkerStatus(
                                worker.id,
                                "active",
                              );

                              await load();
                            }}
                            className="text-xs font-semibold text-[#075b38]"
                          >
                            Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-slate-500"
                  >
                    No Workers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4">
          <form
            onSubmit={
              submit
            }
            className="w-full max-w-xl rounded-2xl bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Add Worker
                </h3>

                <p className="mt-1 text-xs font-medium text-slate-600">
                  Create a casual Worker without creating a login account.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setModalOpen(
                    false,
                  )
                }
              >
                <X
                  size={20}
                />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <Field
                label="Full name"
                required
              >
                <input
                  required
                  placeholder="Worker full name"
                  value={
                    form.name
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,
                      name:
                        event
                          .target
                          .value,
                    })
                  }
                  className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#b88a45]"
                />
              </Field>

              <Field label="Phone">
                <input
                  placeholder="Optional"
                  value={
                    form.phone
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,
                      phone:
                        event
                          .target
                          .value,
                    })
                  }
                  className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#b88a45]"
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  placeholder="Optional"
                  value={
                    form.email
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,
                      email:
                        event
                          .target
                          .value,
                    })
                  }
                  className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#b88a45]"
                />
              </Field>

              <Field label="National ID">
                <input
                  placeholder="Optional"
                  value={
                    form.national_id
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,
                      national_id:
                        event
                          .target
                          .value,
                    })
                  }
                  className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-[#b88a45]"
                />
              </Field>
            </div>

            <div className="flex justify-end gap-2 border-t p-5">
              <button
                type="button"
                onClick={() =>
                  setModalOpen(
                    false,
                  )
                }
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancel
              </button>

              <button
                disabled={
                  saving
                }
                className="rounded-lg bg-[#075b38] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving
                  ? "Creating..."
                  : "Create Worker"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children:
    ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}

        {required ? (
          <span className="ml-1 text-red-500">
            *
          </span>
        ) : (
          <span className="ml-1 font-normal text-slate-400">
            (optional)
          </span>
        )}
      </span>

      {children}
    </label>
  );
}
