"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderCircle,
  PackagePlus,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  addAgentCollectionPurchases,
  cancelAgentCollection,
  completeAgentCollection,
  createAgentCollection,
  getAgentCollection,
  getAgentCollections,
  getAgentCollectionSummary,
  getCurrentDashboardRole,
  getEligibleCollectionPurchases,
  removeAgentCollectionPurchase,
  updateAgentCollection,
} from "@/services/agent-collection-service";

import {
  getActiveAgentsForAllocation,
  getActiveCoffeeSeasonForAllocation,
} from "@/services/cash-allocation-service";

import type {
  ActiveCoffeeSeason,
  CashAllocationAgent,
} from "@/types/cash-allocation";

import type {
  AgentCollection,
  AgentCollectionStatus,
  AgentCollectionSummary,
  EligibleCollectionPurchase,
} from "@/types/agent-collection";

const emptySummary: AgentCollectionSummary = {
  total_collections: 0,
  open_collections: 0,
  completed_collections: 0,
  cancelled_collections: 0,
  completed_quantity_kg: "0.00",
  completed_amount: "0.00",
  farmers_served: 0,
  currency: "RWF",
};

const fieldClass =
  "h-11 w-full rounded-lg border border-slate-400 bg-white px-3 text-sm text-slate-950 outline-none focus:border-[#075b38]";

function today() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

export default function AgentCollectionManagement() {
  const [role, setRole] = useState("");
  const [collections, setCollections] =
    useState<AgentCollection[]>([]);
  const [agents, setAgents] =
    useState<CashAllocationAgent[]>([]);
  const [season, setSeason] =
    useState<ActiveCoffeeSeason | null>(null);

  const [summary, setSummary] =
    useState<AgentCollectionSummary>(
      emptySummary,
    );

  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [agentFilter, setAgentFilter] =
    useState("");

  const [appliedSearch, setAppliedSearch] =
    useState("");
  const [appliedStatus, setAppliedStatus] =
    useState("");
  const [
    appliedAgentFilter,
    setAppliedAgentFilter,
  ] = useState("");

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] =
    useState(1);
  const [total, setTotal] = useState(0);

  const [formOpen, setFormOpen] =
    useState(false);
  const [editing, setEditing] =
    useState<AgentCollection | null>(null);

  const [viewing, setViewing] =
    useState<AgentCollection | null>(null);

  const [addingTo, setAddingTo] =
    useState<AgentCollection | null>(null);

  const [
    eligiblePurchases,
    setEligiblePurchases,
  ] = useState<
    EligibleCollectionPurchase[]
  >([]);

  const [selectedPurchases, setSelectedPurchases] =
    useState<number[]>([]);

  const [completing, setCompleting] =
    useState<AgentCollection | null>(null);

  const [cancelling, setCancelling] =
    useState<AgentCollection | null>(null);

  const [cancelReason, setCancelReason] =
    useState("");

  const [form, setForm] = useState({
    agent_id: "",
    collection_date: today(),
    notes: "",
  });

  const canManage = role === "admin";

  const loadData = useCallback(
    async () => {
      setLoading(true);

      try {
        const [list, totals] =
          await Promise.all([
            getAgentCollections({
              search:
                appliedSearch ||
                undefined,

              status: appliedStatus
                ? (
                    appliedStatus as AgentCollectionStatus
                  )
                : undefined,

              agent_id:
                appliedAgentFilter
                  ? Number(
                      appliedAgentFilter,
                    )
                  : undefined,

              coffee_season_id:
                season?.id,

              page,
              per_page: 15,
            }),

            getAgentCollectionSummary(
              season?.id,
            ),
          ]);

        setCollections(list.items);
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
      appliedSearch,
      appliedStatus,
      appliedAgentFilter,
      page,
      season?.id,
    ],
  );

  useEffect(() => {
    async function init() {
      try {
        const [
          currentRole,
          activeAgents,
          activeSeason,
        ] = await Promise.all([
          getCurrentDashboardRole(),
          getActiveAgentsForAllocation(),
          getActiveCoffeeSeasonForAllocation(),
        ]);

        setRole(currentRole);
        setAgents(activeAgents);
        setSeason(activeSeason);
      } catch (error) {
        setError(
          errorMessage(error),
        );
      }
    }

    void init();
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function openCreate() {
    setEditing(null);

    setForm({
      agent_id: "",
      collection_date: today(),
      notes: "",
    });

    setFormOpen(true);
  }

  function openEdit(
    collection: AgentCollection,
  ) {
    setEditing(collection);

    setForm({
      agent_id: String(
        collection.agent_id,
      ),
      collection_date:
        collection.collection_date,
      notes: collection.notes ?? "",
    });

    setFormOpen(true);
  }

  async function save(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!form.agent_id) {
      setError("Agent is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editing) {
        await updateAgentCollection(
          editing.id,
          {
            collection_date:
              form.collection_date,

            collection_point_id:
              editing
                .collection_point_id,

            notes:
              form.notes.trim() ||
              null,
          },
        );

        setSuccess(
          "Collection updated successfully.",
        );
      } else {
        await createAgentCollection({
          agent_id: Number(
            form.agent_id,
          ),

          collection_date:
            form.collection_date,

          notes:
            form.notes.trim() ||
            null,
        });

        setSuccess(
          "Collection created successfully.",
        );
      }

      setFormOpen(false);
      setEditing(null);

      await loadData();
    } catch (error) {
      setError(
        errorMessage(error),
      );
    } finally {
      setSaving(false);
    }
  }

  async function openView(
    collection: AgentCollection,
  ) {
    try {
      setViewing(
        await getAgentCollection(
          collection.id,
        ),
      );
    } catch (error) {
      setError(
        errorMessage(error),
      );
    }
  }

  async function openAddPurchases(
    collection: AgentCollection,
  ) {
    setError("");
    setSelectedPurchases([]);
    setAddingTo(collection);

    try {
      setEligiblePurchases(
        await getEligibleCollectionPurchases(
          collection.agent_id,
          collection.coffee_season_id,
        ),
      );
    } catch (error) {
      setAddingTo(null);

      setError(
        errorMessage(error),
      );
    }
  }

  async function addPurchases() {
    if (
      !addingTo ||
      selectedPurchases.length === 0
    ) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await addAgentCollectionPurchases(
        addingTo.id,
        selectedPurchases,
      );

      setAddingTo(null);
      setSelectedPurchases([]);

      setSuccess(
        "Purchases added to collection.",
      );

      await loadData();
    } catch (error) {
      setError(
        errorMessage(error),
      );
    } finally {
      setSaving(false);
    }
  }

  async function removePurchase(
    purchaseId: number,
  ) {
    if (!viewing) return;

    setSaving(true);

    try {
      const updated =
        await removeAgentCollectionPurchase(
          viewing.id,
          purchaseId,
        );

      setViewing(updated);

      setSuccess(
        "Purchase removed from collection.",
      );

      await loadData();
    } catch (error) {
      setError(
        errorMessage(error),
      );
    } finally {
      setSaving(false);
    }
  }

  async function completeCollection() {
    if (!completing) return;

    setSaving(true);
    setError("");

    try {
      await completeAgentCollection(
        completing.id,
      );

      setCompleting(null);

      setSuccess(
        "Collection completed successfully.",
      );

      await loadData();
    } catch (error) {
      setError(
        errorMessage(error),
      );
    } finally {
      setSaving(false);
    }
  }

  async function cancelCollection() {
    if (!cancelling) return;

    if (
      cancelReason.trim().length < 3
    ) {
      setError(
        "Cancellation reason is required.",
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      await cancelAgentCollection(
        cancelling.id,
        cancelReason.trim(),
      );

      setCancelling(null);
      setCancelReason("");

      setSuccess(
        "Collection cancelled successfully.",
      );

      await loadData();
    } catch (error) {
      setError(
        errorMessage(error),
      );
    } finally {
      setSaving(false);
    }
  }

  function applyFilters() {
    setAppliedSearch(
      search.trim(),
    );
    setAppliedStatus(status);
    setAppliedAgentFilter(
      agentFilter,
    );
    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setStatus("");
    setAgentFilter("");

    setAppliedSearch("");
    setAppliedStatus("");
    setAppliedAgentFilter("");

    setPage(1);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">
            Agent Collections
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-700">
            Group approved farmer
            purchases collected by each
            field agent.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            disabled={!season}
            onClick={openCreate}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white disabled:opacity-50"
          >
            <Plus size={17} />
            New Collection
          </button>
        )}
      </div>

      <div className="flex items-center justify-between border-y border-[#e5ded4] bg-[#fffaf2] px-4 py-3">
        <div>
          <p className="text-xs font-bold uppercase text-[#91651e]">
            Active Coffee Season
          </p>

          <p className="mt-1 font-bold text-slate-950">
            {season
              ? `${season.name} · ${season.code}`
              : "No active coffee season"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 border-y border-slate-400 md:grid-cols-3 xl:grid-cols-6">
        <Metric
          label="Completed Coffee"
          value={`${number(
            summary.completed_quantity_kg,
          )} Kg`}
        />

        <Metric
          label="Amount Spent"
          value={money(
            summary.completed_amount,
          )}
          strong
        />

        <Metric
          label="Farmers Served"
          value={String(
            summary.farmers_served,
          )}
        />

        <Metric
          label="Completed"
          value={String(
            summary.completed_collections,
          )}
        />

        <Metric
          label="Open"
          value={String(
            summary.open_collections,
          )}
        />

        <Metric
          label="Cancelled"
          value={String(
            summary.cancelled_collections,
          )}
        />
      </div>

      <div className="grid gap-3 border-y border-slate-400 bg-white py-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Search">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Collection or agent..."
              className="h-11 w-full rounded-lg border border-slate-400 bg-white pl-9 pr-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-600 focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]"
            />
          </div>
        </Field>

        <Field label="Status">
          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value,
              )
            }
            className={fieldClass}
          >
            <option value="">
              All Statuses
            </option>
            <option value="open">
              Open
            </option>
            <option value="completed">
              Completed
            </option>
            <option value="cancelled">
              Cancelled
            </option>
          </select>
        </Field>

        <Field label="Agent">
          <select
            value={agentFilter}
            onChange={(event) =>
              setAgentFilter(
                event.target.value,
              )
            }
            className={fieldClass}
          >
            <option value="">
              All Agents
            </option>

            {agents.map((agent) => (
              <option
                key={agent.id}
                value={agent.id}
              >
                {agent.agent_code} —{" "}
                {agent.user?.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex items-end gap-2">
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
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-400 px-4 text-sm font-bold"
          >
            <RotateCcw size={15} />
            Reset
          </button>
        </div>
      </div>

      {error && (
        <Message
          type="error"
          text={error}
        />
      )}

      {success && (
        <Message
          type="success"
          text={success}
        />
      )}

      <section className="overflow-hidden border-y border-slate-400 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-[#f6f1e8]">
              <tr className="border-b text-left text-xs font-bold uppercase text-slate-700">
                <th className="px-4 py-4 text-slate-900">
                  Collection
                </th>
                <th className="px-4 py-4 text-slate-900">
                  Agent
                </th>
                <th className="px-4 py-4 text-slate-900">
                  Point
                </th>
                <th className="px-4 py-4 text-slate-900">
                  Purchases
                </th>
                <th className="px-4 py-4 text-slate-900">
                  Farmers
                </th>
                <th className="px-4 py-4 text-slate-900">
                  Quantity
                </th>
                <th className="px-4 py-4 text-slate-900">
                  Amount
                </th>
                <th className="px-4 py-4 text-slate-900">
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
                      className="mx-auto animate-spin text-[#075b38]"
                    />
                  </td>
                </tr>
              ) : collections.length ? (
                collections.map(
                  (collection) => (
                    <tr
                      key={
                        collection.id
                      }
                      className="border-b border-slate-400 text-sm"
                    >
                      <td className="px-4 py-4 text-slate-900">
                        <p className="font-bold text-[#80570f]">
                          {
                            collection.collection_code
                          }
                        </p>

                        <p className="text-xs text-slate-700">
                          {
                            collection.collection_date
                          }
                        </p>
                      </td>

                      <td className="px-4 py-4 text-slate-900">
                        <p className="font-bold">
                          {collection.agent
                            ?.user?.name ??
                            "—"}
                        </p>

                        <p className="text-xs text-slate-700">
                          {collection.agent
                            ?.agent_code ??
                            "—"}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-slate-900">
                        {collection
                          .collection_point
                          ?.name ?? "—"}
                      </td>

                      <td className="px-4 py-4 text-slate-900">
                        {
                          collection.purchases_count
                        }
                      </td>

                      <td className="px-4 py-4 text-slate-900">
                        {
                          collection.farmers_count
                        }
                      </td>

                      <td className="px-4 py-4 text-slate-900">
                        {number(
                          collection.total_quantity_kg,
                        )}{" "}
                        Kg
                      </td>

                      <td className="px-4 py-4 font-bold">
                        {money(
                          collection.total_amount,
                        )}
                      </td>

                      <td className="px-4 py-4 text-slate-900">
                        <StatusBadge
                          status={
                            collection.status
                          }
                        />
                      </td>

                      <td className="px-4 py-4 text-slate-900">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void openView(
                                collection,
                              )
                            }
                            className="flex h-8 w-9 items-center justify-center rounded-md border border-slate-400 bg-white text-slate-900 hover:bg-slate-100"
                          >
                            <Eye
                              size={15}
                            />
                          </button>

                          {canManage &&
                            collection.status ===
                              "open" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void openAddPurchases(
                                      collection,
                                    )
                                  }
                                  className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-400 bg-white px-3 text-xs font-bold text-slate-900 hover:bg-slate-100"
                                >
                                  <PackagePlus
                                    size={
                                      14
                                    }
                                  />
                                  Purchases
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openEdit(
                                      collection,
                                    )
                                  }
                                  className="h-8 rounded-md border border-slate-400 bg-white px-3 text-xs font-bold text-slate-900 hover:bg-slate-100"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setCompleting(
                                      collection,
                                    )
                                  }
                                  className="h-8 rounded-md bg-emerald-50 px-3 text-xs font-bold text-emerald-800"
                                >
                                  Complete
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setCancelling(
                                      collection,
                                    );
                                    setCancelReason(
                                      "",
                                    );
                                  }}
                                  className="h-8 rounded-md bg-red-50 px-3 text-xs font-bold text-red-700"
                                >
                                  Cancel
                                </button>
                              </>
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
                    className="py-16 text-center text-sm text-slate-700"
                  >
                    No agent collections
                    found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t px-4 py-4">
          <p className="text-sm text-slate-700">
            {total} collections · Page{" "}
            <b>{page}</b> of{" "}
            <b>{lastPage}</b>
          </p>

          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() =>
                setPage(page - 1)
              }
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-400 bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft
                size={17}
              />
            </button>

            <button
              disabled={
                page >= lastPage
              }
              onClick={() =>
                setPage(page + 1)
              }
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-400 bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight
                size={17}
              />
            </button>
          </div>
        </div>
      </section>

      {formOpen && (
        <Modal>
          <form
            onSubmit={save}
            className="w-full max-w-xl rounded-xl bg-white shadow-2xl"
          >
            <ModalHeader
              title={
                editing
                  ? "Edit Agent Collection"
                  : "New Agent Collection"
              }
              close={() =>
                setFormOpen(false)
              }
            />

            <div className="space-y-4 p-6">
              <Field
                label="Agent"
                required
              >
                <select
                  required
                  disabled={!!editing}
                  value={
                    form.agent_id
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      agent_id:
                        event.target
                          .value,
                    })
                  }
                  className={
                    fieldClass
                  }
                >
                  <option value="">
                    Select Agent
                  </option>

                  {agents.map(
                    (agent) => (
                      <option
                        key={
                          agent.id
                        }
                        value={
                          agent.id
                        }
                      >
                        {
                          agent.agent_code
                        }{" "}
                        —{" "}
                        {
                          agent.user
                            ?.name
                        }
                      </option>
                    ),
                  )}
                </select>
              </Field>

              <Field
                label="Collection Date"
                required
              >
                <input
                  required
                  type="date"
                  value={
                    form.collection_date
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      collection_date:
                        event.target
                          .value,
                    })
                  }
                  className={
                    fieldClass
                  }
                />
              </Field>

              <Field label="Notes">
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      notes:
                        event.target
                          .value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-400 bg-white p-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-600 focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]"
                />
              </Field>
            </div>

            <ModalActions
              close={() =>
                setFormOpen(false)
              }
              saving={saving}
              action={
                editing
                  ? "Save Changes"
                  : "Create Collection"
              }
            />
          </form>
        </Modal>
      )}

      {addingTo && (
        <Modal>
          <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl">
            <ModalHeader
              title="Add Coffee Purchases"
              close={() =>
                setAddingTo(null)
              }
            />

            <div className="max-h-[55vh] overflow-y-auto p-5">
              {eligiblePurchases.length ? (
                eligiblePurchases.map(
                  (purchase) => (
                    <label
                      key={
                        purchase.id
                      }
                      className="flex cursor-pointer items-center gap-4 border-b py-3"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPurchases.includes(
                          purchase.id,
                        )}
                        onChange={(
                          event,
                        ) => {
                          setSelectedPurchases(
                            event
                              .target
                              .checked
                              ? [
                                  ...selectedPurchases,
                                  purchase.id,
                                ]
                              : selectedPurchases.filter(
                                  (
                                    id,
                                  ) =>
                                    id !==
                                    purchase.id,
                                ),
                          );
                        }}
                      />

                      <div className="flex-1">
                        <p className="font-bold">
                          {
                            purchase.purchase_code
                          }{" "}
                          ·{" "}
                          {purchase
                            .farmer
                            ?.full_name ??
                            "Farmer"}
                        </p>

                        <p className="text-xs text-slate-700">
                          {number(
                            purchase.quantity_kg,
                          )}{" "}
                          Kg ·{" "}
                          {money(
                            purchase.total_amount,
                          )}
                        </p>
                      </div>
                    </label>
                  ),
                )
              ) : (
                <p className="py-10 text-center text-sm text-slate-700">
                  No approved,
                  unassigned purchases
                  are available for this
                  agent.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t p-4">
              <button
                onClick={() =>
                  setAddingTo(null)
                }
                className="h-10 rounded-lg border border-slate-400 bg-white px-5 text-sm font-bold text-slate-900 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                disabled={
                  saving ||
                  selectedPurchases
                    .length === 0
                }
                onClick={() =>
                  void addPurchases()
                }
                className="h-10 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white disabled:opacity-50"
              >
                Add Selected
              </button>
            </div>
          </div>
        </Modal>
      )}

      {viewing && (
        <Modal>
          <div className="w-full max-w-4xl rounded-xl bg-white shadow-2xl">
            <ModalHeader
              title={
                viewing.collection_code
              }
              close={() =>
                setViewing(null)
              }
            />

            <div className="grid gap-x-5 px-6 py-2 md:grid-cols-3">
              <Detail
                label="Agent"
                value={
                  viewing.agent
                    ?.user?.name ??
                  "—"
                }
              />

              <Detail
                label="Collection Point"
                value={
                  viewing
                    .collection_point
                    ?.name ?? "—"
                }
              />

              <Detail
                label="Status"
                value={
                  viewing.status
                }
              />

              <Detail
                label="Purchases"
                value={String(
                  viewing.purchases_count,
                )}
              />

              <Detail
                label="Farmers"
                value={String(
                  viewing.farmers_count,
                )}
              />

              <Detail
                label="Quantity"
                value={`${number(
                  viewing.total_quantity_kg,
                )} Kg`}
              />

              <Detail
                label="Amount"
                value={money(
                  viewing.total_amount,
                )}
              />

              <Detail
                label="Date"
                value={
                  viewing.collection_date
                }
              />

              <Detail
                label="Completed By"
                value={
                  viewing.completer
                    ?.name ?? "—"
                }
              />
            </div>

            <div className="border-t px-6 py-4">
              <h3 className="mb-3 font-bold">
                Coffee Purchases
              </h3>

              {viewing.purchases
                ?.length ? (
                viewing.purchases.map(
                  (purchase) => (
                    <div
                      key={
                        purchase.id
                      }
                      className="flex items-center justify-between border-b py-3 text-sm"
                    >
                      <div>
                        <p className="font-bold">
                          {
                            purchase.purchase_code
                          }{" "}
                          ·{" "}
                          {purchase
                            .farmer
                            ?.full_name ??
                            "Farmer"}
                        </p>

                        <p className="text-xs text-slate-700">
                          {number(
                            purchase.quantity_kg,
                          )}{" "}
                          Kg ·{" "}
                          {money(
                            purchase.total_amount,
                          )}
                        </p>
                      </div>

                      {canManage &&
                        viewing.status ===
                          "open" && (
                          <button
                            onClick={() =>
                              void removePurchase(
                                purchase.id,
                              )
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-md bg-red-50 text-red-700"
                          >
                            <Trash2
                              size={14}
                            />
                          </button>
                        )}
                    </div>
                  ),
                )
              ) : (
                <p className="text-sm text-slate-700">
                  No purchases attached.
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {completing && (
        <Confirm
          title="Complete Collection"
          text={`Complete ${completing.collection_code}? After completion, purchases are locked in this collection.`}
          action="Complete Collection"
          saving={saving}
          close={() =>
            setCompleting(null)
          }
          confirm={() =>
            void completeCollection()
          }
        />
      )}

      {cancelling && (
        <Modal>
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
            <ModalHeader
              title="Cancel Collection"
              close={() =>
                setCancelling(null)
              }
            />

            <div className="p-5">
              <Field
                label="Cancellation Reason"
                required
              >
                <textarea
                  rows={4}
                  value={cancelReason}
                  onChange={(event) =>
                    setCancelReason(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-slate-400 bg-white p-3 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-600 focus:border-[#075b38] focus:ring-1 focus:ring-[#075b38]"
                />
              </Field>
            </div>

            <div className="flex justify-end gap-3 border-t p-4">
              <button
                onClick={() =>
                  setCancelling(null)
                }
                className="h-10 rounded-lg border border-slate-400 bg-white px-4 text-sm font-bold text-slate-900 hover:bg-slate-100"
              >
                Keep Collection
              </button>

              <button
                disabled={
                  saving ||
                  cancelReason.trim()
                    .length < 3
                }
                onClick={() =>
                  void cancelCollection()
                }
                className="h-10 rounded-lg bg-red-700 px-4 text-sm font-bold text-white disabled:opacity-50"
              >
                Cancel Collection
              </button>
            </div>
          </div>
        </Modal>
      )}
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

function ModalHeader({
  title,
  close,
}: {
  title: string;
  close: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b px-6 py-4">
      <h2 className="text-xl font-extrabold text-slate-950">
        {title}
      </h2>

      <button
        onClick={close}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-400 bg-white text-slate-900 hover:bg-slate-100"
      >
        <X size={18} />
      </button>
    </div>
  );
}

function ModalActions({
  close,
  saving,
  action,
}: {
  close: () => void;
  saving: boolean;
  action: string;
}) {
  return (
    <div className="flex justify-end gap-3 border-t px-6 py-4">
      <button
        type="button"
        onClick={close}
        className="h-10 rounded-lg border border-slate-400 bg-white px-5 text-sm font-bold text-slate-900 hover:bg-slate-100"
      >
        Cancel
      </button>

      <button
        disabled={saving}
        className="h-10 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white disabled:opacity-50"
      >
        {saving
          ? "Saving..."
          : action}
      </button>
    </div>
  );
}

function Confirm({
  title,
  text,
  action,
  saving,
  close,
  confirm,
}: {
  title: string;
  text: string;
  action: string;
  saving: boolean;
  close: () => void;
  confirm: () => void;
}) {
  return (
    <Modal>
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        <ModalHeader
          title={title}
          close={close}
        />

        <p className="p-5 text-sm font-medium text-slate-800">
          {text}
        </p>

        <div className="flex justify-end gap-3 border-t p-4">
          <button
            onClick={close}
            className="h-10 rounded-lg border border-slate-400 bg-white px-4 text-sm font-bold text-slate-900 hover:bg-slate-100"
          >
            Not Now
          </button>

          <button
            disabled={saving}
            onClick={confirm}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#075b38] px-4 text-sm font-bold text-white disabled:opacity-50"
          >
            <Check size={16} />
            {action}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-900">
        {label}
        {required && (
          <span className="ml-1 text-red-600">
            *
          </span>
        )}
      </label>

      {children}
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
    <div className="border-r border-slate-400 px-4 py-4">
      <p className="text-xs font-bold uppercase text-slate-700">
        {label}
      </p>

      <p
        className={`mt-1 text-lg font-extrabold ${
          strong
            ? "text-[#075b38]"
            : "text-slate-950"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b py-4">
      <p className="text-xs font-bold uppercase text-slate-700">
        {label}
      </p>

      <p className="mt-1 font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: AgentCollectionStatus;
}) {
  const style =
    status === "completed"
      ? "bg-emerald-50 text-emerald-800"
      : status === "cancelled"
        ? "bg-red-50 text-red-700"
        : "bg-amber-50 text-amber-800";

  return (
    <span
      className={`rounded-md px-2.5 py-1 text-xs font-bold capitalize ${style}`}
    >
      {status}
    </span>
  );
}

function Message({
  type,
  text,
}: {
  type: "error" | "success";
  text: string;
}) {
  return (
    <div
      className={
        type === "error"
          ? "border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
          : "border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
      }
    >
      {text}
    </div>
  );
}

function number(
  value: string | number,
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 2,
    },
  ).format(Number(value) || 0);
}

function money(
  value: string | number,
) {
  return `${number(value)} RWF`;
}

function errorMessage(
  error: unknown,
) {
  return error instanceof Error
    ? error.message
    : "Something went wrong.";
}
