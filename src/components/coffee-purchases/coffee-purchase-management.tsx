"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  LoaderCircle,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  approveCoffeePurchase,
  cancelCoffeePurchase,
  createCoffeePurchase,
  getCoffeePurchase,
  getCoffeePurchases,
  getCoffeePurchaseSummary,
  getPurchaseFarmers,
  updateCoffeePurchase,
} from "@/services/coffee-purchase-service";

import {
  getActiveAgentsForAllocation,
  getActiveCoffeeSeasonForAllocation,
} from "@/services/cash-allocation-service";

import type {
  ActiveCoffeeSeason,
  CashAllocationAgent,
} from "@/types/cash-allocation";

import type {
  CoffeePurchase,
  CoffeePurchaseStatus,
  CoffeePurchaseSummary,
  CoffeeType,
  PurchaseFarmer,
} from "@/types/coffee-purchase";

const emptySummary: CoffeePurchaseSummary = {
  total_records: 0,
  draft_records: 0,
  approved_records: 0,
  cancelled_records: 0,
  approved_quantity_kg: "0.00",
  approved_amount: "0.00",
  currency: "RWF",
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function CoffeePurchaseManagement() {
  const [purchases, setPurchases] = useState<CoffeePurchase[]>([]);
  const [agents, setAgents] = useState<CashAllocationAgent[]>([]);
  const [farmers, setFarmers] = useState<PurchaseFarmer[]>([]);
  const [season, setSeason] = useState<ActiveCoffeeSeason | null>(null);

  const [summary, setSummary] =
    useState<CoffeePurchaseSummary>(emptySummary);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [coffeeType, setCoffeeType] = useState("");

  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");
  const [appliedCoffeeType, setAppliedCoffeeType] = useState("");

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CoffeePurchase | null>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewing, setViewing] = useState<CoffeePurchase | null>(null);

  const [approveOpen, setApproveOpen] = useState(false);
  const [approving, setApproving] = useState<CoffeePurchase | null>(null);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState<CoffeePurchase | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const [form, setForm] = useState({
    agent_id: "",
    farmer_id: "",
    coffee_type: "cherry" as CoffeeType,
    quantity_kg: "",
    purchase_date: today(),
    purpose: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [result, summaryResult] = await Promise.all([
        getCoffeePurchases({
          search: appliedSearch || undefined,
          status: appliedStatus
            ? (appliedStatus as CoffeePurchaseStatus)
            : undefined,
          coffee_type: appliedCoffeeType
            ? (appliedCoffeeType as CoffeeType)
            : undefined,
          page,
          per_page: 15,
        }),
        getCoffeePurchaseSummary(),
      ]);

      setPurchases(result.items);
      setSummary(summaryResult);
      setTotal(result.pagination.total);
      setLastPage(
        Math.max(1, result.pagination.last_page),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load coffee purchases.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    appliedSearch,
    appliedStatus,
    appliedCoffeeType,
    page,
  ]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [activeAgents, activeFarmers, activeSeason] =
          await Promise.all([
            getActiveAgentsForAllocation(),
            getPurchaseFarmers(),
            getActiveCoffeeSeasonForAllocation(),
          ]);

        setAgents(activeAgents);
        setFarmers(activeFarmers);
        setSeason(activeSeason);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load purchase options.",
        );
      }
    }

    void loadOptions();
  }, []);

  function openCreate() {
    setError("");
    setSuccess("");
    setEditing(null);

    setForm({
      agent_id: "",
      farmer_id: "",
      coffee_type: "cherry",
      quantity_kg: "",
      purchase_date: today(),
      purpose: "",
    });

    setFormOpen(true);
  }

  function openEdit(purchase: CoffeePurchase) {
    if (purchase.status !== "draft") return;

    setEditing(purchase);

    setForm({
      agent_id: String(purchase.agent_id),
      farmer_id: String(purchase.farmer_id),
      coffee_type: purchase.coffee_type,
      quantity_kg: String(purchase.quantity_kg),
      purchase_date: purchase.purchase_date,
      purpose: purchase.purpose ?? "",
    });

    setFormOpen(true);
  }

  async function save(event: FormEvent) {
    event.preventDefault();

    const quantity = Number(form.quantity_kg);

    if (
      !form.agent_id ||
      !form.farmer_id ||
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      setError(
        "Agent, Farmer and a valid quantity are required.",
      );
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      agent_id: Number(form.agent_id),
      farmer_id: Number(form.farmer_id),
      coffee_type: form.coffee_type,
      quantity_kg: quantity,
      purchase_date: form.purchase_date,
      purpose: form.purpose.trim() || null,
    };

    try {
      if (editing) {
        await updateCoffeePurchase(
          editing.id,
          payload,
        );

        setSuccess(
          "Coffee purchase updated successfully.",
        );
      } else {
        await createCoffeePurchase(payload);

        setSuccess(
          "Coffee purchase created successfully.",
        );
      }

      setFormOpen(false);
      setEditing(null);

      await loadData();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save coffee purchase.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function openView(purchase: CoffeePurchase) {
    setViewing(purchase);
    setViewOpen(true);

    try {
      setViewing(
        await getCoffeePurchase(purchase.id),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load purchase details.",
      );
    }
  }

  async function confirmApprove() {
    if (!approving) return;

    try {
      await approveCoffeePurchase(approving.id);

      setSuccess(
        "Coffee purchase approved successfully.",
      );

      setApproveOpen(false);
      setApproving(null);

      await loadData();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to approve purchase.",
      );
    }
  }

  async function confirmCancel() {
    if (!cancelling) return;

    const reason = cancelReason.trim();

    if (reason.length < 3) {
      setError(
        "Cancellation reason must contain at least 3 characters.",
      );
      return;
    }

    try {
      await cancelCoffeePurchase(
        cancelling.id,
        reason,
      );

      setSuccess(
        "Coffee purchase cancelled successfully.",
      );

      setCancelOpen(false);
      setCancelling(null);
      setCancelReason("");

      await loadData();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to cancel purchase.",
      );
    }
  }

  function applyFilters() {
    setAppliedSearch(search.trim());
    setAppliedStatus(status);
    setAppliedCoffeeType(coffeeType);
    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setStatus("");
    setCoffeeType("");

    setAppliedSearch("");
    setAppliedStatus("");
    setAppliedCoffeeType("");
    setPage(1);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">
            Coffee Purchases
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-600">
            Record and approve coffee purchased from farmers by field agents.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white"
        >
          <Plus size={17} />
          New Purchase
        </button>
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

        {season && (
          <span className="rounded-md bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
            Active
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 border-y border-slate-200 md:grid-cols-3 xl:grid-cols-5">
        <Metric
          label="Approved Amount"
          value={money(summary.approved_amount)}
          strong
        />

        <Metric
          label="Coffee Purchased"
          value={`${number(summary.approved_quantity_kg)} Kg`}
        />

        <Metric
          label="Approved"
          value={String(summary.approved_records)}
        />

        <Metric
          label="Draft"
          value={String(summary.draft_records)}
        />

        <Metric
          label="Cancelled"
          value={String(summary.cancelled_records)}
        />
      </div>

      <section className="border-y border-slate-200 bg-white py-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Purchase, farmer, agent..."
                className="h-11 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm text-slate-950 outline-none focus:border-[#075b38]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-slate-800">
              Status
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={fieldClass}
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="approved">Approved</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-slate-800">
              Coffee Type
            </label>

            <select
              value={coffeeType}
              onChange={(e) => setCoffeeType(e.target.value)}
              className={fieldClass}
            >
              <option value="">All Types</option>
              <option value="cherry">Cherry</option>
              <option value="parchment">Parchment</option>
              <option value="green_coffee">Green Coffee</option>
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
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-400 px-4 text-sm font-bold text-slate-900"
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

      {success && (
        <div className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {success}
        </div>
      )}

      <section className="overflow-hidden border-y border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-[#fcfbf9]">
              <tr className="border-b text-left text-xs font-bold uppercase text-slate-700">
                <th className="px-4 py-4">Purchase</th>
                <th className="px-4 py-4">Agent</th>
                <th className="px-4 py-4">Farmer</th>
                <th className="px-4 py-4">Coffee</th>
                <th className="px-4 py-4">Quantity</th>
                <th className="px-4 py-4">Price/Kg</th>
                <th className="px-4 py-4">Total</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-20">
                    <LoaderCircle
                      size={30}
                      className="mx-auto animate-spin text-[#075b38]"
                    />
                  </td>
                </tr>
              ) : purchases.length ? (
                purchases.map((purchase) => (
                  <tr
                    key={purchase.id}
                    className="border-b border-slate-100 text-sm"
                  >
                    <td className="px-4 py-4">
                      <p className="font-bold text-[#80570f]">
                        {purchase.purchase_code}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {purchase.purchase_date}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-950">
                        {purchase.agent?.user?.name ?? "—"}
                      </p>

                      <p className="text-xs text-slate-500">
                        {purchase.agent?.agent_code ?? "—"}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">
                        {purchase.farmer?.full_name ?? "—"}
                      </p>

                      <p className="text-xs text-slate-500">
                        {purchase.farmer?.farmer_code ?? "—"}
                      </p>
                    </td>

                    <td className="px-4 py-4 font-semibold text-slate-800">
                      {coffeeName(purchase.coffee_type)}
                    </td>

                    <td className="px-4 py-4">
                      {number(purchase.quantity_kg)} Kg
                    </td>

                    <td className="px-4 py-4">
                      {money(purchase.price_per_kg)}
                    </td>

                    <td className="px-4 py-4 font-bold text-slate-950">
                      {money(purchase.total_amount)}
                    </td>

                    <td className="px-4 py-4">
                      <Status status={purchase.status} />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => void openView(purchase)}
                          className="flex h-8 w-9 items-center justify-center rounded-md border border-slate-300"
                        >
                          <Eye size={15} />
                        </button>

                        {purchase.status === "draft" && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEdit(purchase)}
                              className="flex h-8 items-center gap-1 rounded-md border border-slate-300 px-3 text-xs font-bold"
                            >
                              <Pencil size={14} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setApproving(purchase);
                                setApproveOpen(true);
                              }}
                              className="h-8 rounded-md bg-emerald-50 px-3 text-xs font-bold text-emerald-800"
                            >
                              Approve
                            </button>
                          </>
                        )}

                        {purchase.status !== "cancelled" && (
                          <button
                            type="button"
                            onClick={() => {
                              setCancelling(purchase);
                              setCancelReason("");
                              setCancelOpen(true);
                            }}
                            className="h-8 rounded-md bg-red-50 px-3 text-xs font-bold text-red-700"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="py-16 text-center text-sm text-slate-600"
                  >
                    No coffee purchases found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t px-4 py-4">
          <p className="text-sm text-slate-600">
            {total} purchases · Page <b>{page}</b> of{" "}
            <b>{lastPage}</b>
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(Math.max(1, page - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-md border disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>

            <button
              type="button"
              disabled={page >= lastPage}
              onClick={() => setPage(page + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-md border disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {formOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={save}
            className="w-full max-w-2xl rounded-xl bg-white shadow-2xl"
          >
            <ModalHeader
              title={
                editing
                  ? "Edit Coffee Purchase"
                  : "New Coffee Purchase"
              }
              subtitle="Price and total amount are calculated automatically."
              close={() => setFormOpen(false)}
            />

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <Field label="Agent" required>
                <select
                  required
                  value={form.agent_id}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      agent_id: e.target.value,
                    })
                  }
                  className={fieldClass}
                >
                  <option value="">Select Agent</option>

                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.agent_code} — {agent.user?.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Farmer" required>
                <select
                  required
                  value={form.farmer_id}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      farmer_id: e.target.value,
                    })
                  }
                  className={fieldClass}
                >
                  <option value="">Select Farmer</option>

                  {farmers.map((farmer) => (
                    <option key={farmer.id} value={farmer.id}>
                      {farmer.farmer_code} — {farmer.full_name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Coffee Type" required>
                <select
                  value={form.coffee_type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      coffee_type:
                        e.target.value as CoffeeType,
                    })
                  }
                  className={fieldClass}
                >
                  <option value="cherry">Cherry</option>
                  <option value="parchment">Parchment</option>
                  <option value="green_coffee">
                    Green Coffee
                  </option>
                </select>
              </Field>

              <Field label="Quantity (Kg)" required>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.quantity_kg}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      quantity_kg: e.target.value,
                    })
                  }
                  className={fieldClass}
                />
              </Field>

              <Field label="Purchase Date" required>
                <input
                  required
                  type="date"
                  value={form.purchase_date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      purchase_date: e.target.value,
                    })
                  }
                  className={fieldClass}
                />
              </Field>

              <div className="flex items-end">
                <div className="w-full border-l-4 border-[#c99a45] bg-[#fffaf2] px-4 py-3">
                  <p className="text-xs font-bold uppercase text-slate-600">
                    Price
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-950">
                    Calculated by the backend using the active coffee price.
                  </p>
                </div>
              </div>

              <div className="md:col-span-2">
                <Field label="Purpose">
                  <textarea
                    rows={3}
                    value={form.purpose}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        purpose: e.target.value,
                      })
                    }
                    className={textareaClass}
                    placeholder="Example: Coffee purchased during field collection"
                  />
                </Field>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="h-10 rounded-lg border border-slate-400 px-5 text-sm font-bold text-slate-900"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="h-10 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editing
                    ? "Save Changes"
                    : "Create Purchase"}
              </button>
            </div>
          </form>
        </div>
      )}

      {viewOpen && viewing && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl">
            <ModalHeader
              title="Purchase Details"
              subtitle={viewing.purchase_code}
              close={() => setViewOpen(false)}
            />

            <div className="grid grid-cols-1 gap-x-6 px-6 py-3 md:grid-cols-3">
              <Detail label="Agent" value={viewing.agent?.user?.name ?? "—"} />
              <Detail label="Farmer" value={viewing.farmer?.full_name ?? "—"} />
              <Detail label="Coffee" value={coffeeName(viewing.coffee_type)} />

              <Detail
                label="Quantity"
                value={`${number(viewing.quantity_kg)} Kg`}
              />

              <Detail
                label="Price / Kg"
                value={money(viewing.price_per_kg)}
              />

              <Detail
                label="Total Amount"
                value={money(viewing.total_amount)}
              />

              <Detail label="Date" value={viewing.purchase_date} />
              <Detail label="Status" value={viewing.status} />
              <Detail
                label="Approved By"
                value={viewing.approver?.name ?? "—"}
              />

              <div className="py-4 md:col-span-3">
                <p className="text-xs font-bold uppercase text-slate-600">
                  Purpose
                </p>

                <p className="mt-2 text-sm font-medium text-slate-900">
                  {viewing.purpose || "No purpose provided."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {approveOpen && approving && (
        <ConfirmModal
          title="Approve Coffee Purchase"
          text={`${approving.purchase_code} · ${money(
            approving.total_amount,
          )}`}
          confirmText="Approve Purchase"
          close={() => {
            setApproveOpen(false);
            setApproving(null);
          }}
          confirm={() => void confirmApprove()}
        />
      )}

      {cancelOpen && cancelling && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
            <ModalHeader
              title="Cancel Coffee Purchase"
              subtitle={`${cancelling.purchase_code} · ${money(
                cancelling.total_amount,
              )}`}
              close={() => setCancelOpen(false)}
            />

            <div className="p-5">
              <Field label="Cancellation Reason" required>
                <textarea
                  rows={4}
                  autoFocus
                  value={cancelReason}
                  onChange={(e) =>
                    setCancelReason(e.target.value)
                  }
                  className={textareaClass}
                  placeholder="Why is this purchase being cancelled?"
                />
              </Field>
            </div>

            <div className="flex justify-end gap-3 border-t px-5 py-4">
              <button
                type="button"
                onClick={() => setCancelOpen(false)}
                className="h-10 rounded-lg border border-slate-400 px-4 text-sm font-bold text-slate-900"
              >
                Keep Purchase
              </button>

              <button
                type="button"
                disabled={cancelReason.trim().length < 3}
                onClick={() => void confirmCancel()}
                className="h-10 rounded-lg bg-red-700 px-4 text-sm font-bold text-white disabled:opacity-50"
              >
                Cancel Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const fieldClass =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-[#075b38]";

const textareaClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none focus:border-[#075b38]";

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-900">
        {label}

        {required && (
          <span className="ml-1 text-red-600">*</span>
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
    <div className="border-r border-slate-200 px-4 py-4 last:border-r-0">
      <p className="text-xs font-bold uppercase text-slate-600">
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

function ModalHeader({
  title,
  subtitle,
  close,
}: {
  title: string;
  subtitle: string;
  close: () => void;
}) {
  return (
    <div className="flex items-start justify-between border-b px-6 py-4">
      <div>
        <h2 className="text-xl font-extrabold text-slate-950">
          {title}
        </h2>

        <p className="mt-1 text-sm font-medium text-slate-700">
          {subtitle}
        </p>
      </div>

      <button
        type="button"
        onClick={close}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-400 text-slate-950 hover:bg-slate-100"
      >
        <X size={19} />
      </button>
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
    <div className="border-b border-slate-200 py-4">
      <p className="text-xs font-bold uppercase text-slate-600">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function Status({
  status,
}: {
  status: CoffeePurchaseStatus;
}) {
  const style =
    status === "approved"
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

function ConfirmModal({
  title,
  text,
  confirmText,
  close,
  confirm,
}: {
  title: string;
  text: string;
  confirmText: string;
  close: () => void;
  confirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        <ModalHeader
          title={title}
          subtitle={text}
          close={close}
        />

        <div className="p-5">
          <p className="text-sm font-medium text-slate-800">
            Approval will deduct this purchase amount from the agent&apos;s available wallet balance.
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t px-5 py-4">
          <button
            type="button"
            onClick={close}
            className="h-10 rounded-lg border border-slate-400 px-4 text-sm font-bold text-slate-900"
          >
            Not Now
          </button>

          <button
            type="button"
            onClick={confirm}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#075b38] px-4 text-sm font-bold text-white"
          >
            <Check size={16} />
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function coffeeName(type: CoffeeType) {
  if (type === "green_coffee") {
    return "Green Coffee";
  }

  return type.charAt(0).toUpperCase() + type.slice(1);
}

function money(value: string | number) {
  return `${number(value)} RWF`;
}

function number(value: string | number) {
  const amount = Number(value);

  return new Intl.NumberFormat(
    "en-US",
    {
      maximumFractionDigits: 2,
    },
  ).format(
    Number.isFinite(amount)
      ? amount
      : 0,
  );
}
