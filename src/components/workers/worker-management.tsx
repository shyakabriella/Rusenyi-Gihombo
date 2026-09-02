"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  CirclePlus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import {
  createUser,
  getUsers,
  updateUserStatus,
} from "@/services/user-service";

import type {
  User,
} from "@/types/user";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
};

export default function WorkerManagement() {
  const [workers, setWorkers] =
    useState<User[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [form, setForm] =
    useState(emptyForm);

  const load =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const result =
          await getUsers({
            role: "worker",
            search:
              search ||
              undefined,
            per_page: 100,
          });

        setWorkers(
          result.users ?? [],
        );
      } catch (requestError) {
        setError(
          requestError
            instanceof Error
            ? requestError.message
            : "Unable to load Workers.",
        );
      } finally {
        setLoading(false);
      }
    }, [search]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit(
    event: FormEvent,
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const result =
        await createUser({
          name:
            form.name.trim(),
          email:
            form.email.trim(),
          phone:
            form.phone.trim(),
          role: "worker",
        });

      setMessage(
        result.credentials_email_sent
          ? "Worker created and credentials sent."
          : "Worker created successfully.",
      );

      setForm(emptyForm);
      setModalOpen(false);

      await load();
    } catch (requestError) {
      setError(
        requestError
          instanceof Error
          ? requestError.message
          : "Unable to create Worker.",
      );
    } finally {
      setSaving(false);
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
            Manage factory Workers
            and make them available
            for Payroll.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setModalOpen(true)
          }
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#075b38] px-4 text-sm font-semibold text-white"
        >
          <CirclePlus size={18} />
          Add Worker
        </button>
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
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search Worker..."
              className="h-10 w-full rounded-lg border pl-10 pr-3 text-sm"
            />
          </div>

          <button
            type="button"
            onClick={() =>
              void load()
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#faf7f1] text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">
                  Worker
                </th>
                <th className="px-4 py-3">
                  Phone
                </th>
                <th className="px-4 py-3">
                  Status
                </th>
                <th className="px-4 py-3">
                  Payroll
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
                    colSpan={5}
                    className="py-10 text-center text-slate-500"
                  >
                    Loading Workers...
                  </td>
                </tr>
              ) : workers.length ? (
                workers.map(
                  (worker) => (
                    <tr key={worker.id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-950">
                          {worker.name}
                        </p>
                        <p className="text-xs text-slate-600">
                          {worker.email}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {worker.phone ??
                          "—"}
                      </td>

                      <td className="px-4 py-3 capitalize text-slate-700">
                        {worker.status ??
                          "active"}
                      </td>

                      <td className="px-4 py-3">
                        <Link
                          href="/dashboard/finance/payroll"
                          className="text-xs font-semibold text-[#075b38]"
                        >
                          Open Payroll
                        </Link>
                      </td>

                      <td className="px-4 py-3">
                        {worker.is_active ? (
                          <button
                            type="button"
                            onClick={async () => {
                              await updateUserStatus(
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
                              await updateUserStatus(
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
                    colSpan={5}
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
            onSubmit={submit}
            className="w-full max-w-xl rounded-2xl bg-white"
          >
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Add Worker
                </h3>

                <p className="mt-1 text-xs font-medium text-slate-700">
                  The Worker will
                  automatically become
                  available in Payroll.
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
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <input
                required
                placeholder="Full name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name:
                      e.target.value,
                  })
                }
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-950 outline-none placeholder:text-slate-500 focus:border-[#b88a45] focus:ring-1 focus:ring-[#b88a45]/20"
              />

              <input
                required
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email:
                      e.target.value,
                  })
                }
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-950 outline-none placeholder:text-slate-500 focus:border-[#b88a45] focus:ring-1 focus:ring-[#b88a45]/20"
              />

              <input
                required
                placeholder="Phone"
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone:
                      e.target.value,
                  })
                }
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-950 outline-none placeholder:text-slate-500 focus:border-[#b88a45] focus:ring-1 focus:ring-[#b88a45]/20"
              />
            </div>

            <div className="flex justify-end gap-2 border-t p-5">
              <button
                type="button"
                onClick={() =>
                  setModalOpen(
                    false,
                  )
                }
                className="rounded-lg border px-4 py-2"
              >
                Cancel
              </button>

              <button
                disabled={saving}
                className="rounded-lg bg-[#075b38] px-5 py-2 font-semibold text-white disabled:opacity-50"
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
