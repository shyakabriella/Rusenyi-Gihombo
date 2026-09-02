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
  WalletCards,
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
  cancelDirectFarmerDelivery,
  confirmDirectFarmerDelivery,
  createDirectFarmerDelivery,
  getBalanceOfficers,
  getDirectDeliveryFarmers,
  getDirectFarmerDeliveries,
  getDirectFarmerDelivery,
  getDirectFarmerDeliverySummary,
  payDirectFarmerDelivery,
  updateDirectFarmerDelivery,
  uploadDirectFarmerPaymentProof,
} from "@/services/direct-farmer-delivery-service";

import {
  getActiveCoffeeSeasonForAllocation,
} from "@/services/cash-allocation-service";

import type {
  ActiveCoffeeSeason,
} from "@/types/cash-allocation";

import type {
  BalanceOfficer,
  DirectDeliveryCoffeeType,
  DirectDeliveryFarmer,
  DirectDeliveryStatus,
  DirectFarmerDelivery,
  DirectFarmerDeliverySummary,
  FarmerPaymentMethod,
  FarmerPaymentStatus,
} from "@/types/direct-farmer-delivery";

const blankSummary: DirectFarmerDeliverySummary = {
  total_records: 0,
  draft_records: 0,
  confirmed_records: 0,
  cancelled_records: 0,
  confirmed_quantity_kg: "0.00",
  confirmed_amount: "0.00",
  paid_amount: "0.00",
  currency: "RWF",
};

const fieldClass =
  "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-[#075b38]";

const textareaClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-950 outline-none focus:border-[#075b38]";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function DirectFarmerDeliveryManagement() {
  const [deliveries, setDeliveries] =
    useState<DirectFarmerDelivery[]>([]);

  const [farmers, setFarmers] =
    useState<DirectDeliveryFarmer[]>([]);

  const [officers, setOfficers] =
    useState<BalanceOfficer[]>([]);

  const [season, setSeason] =
    useState<ActiveCoffeeSeason | null>(null);

  const [summary, setSummary] =
    useState<DirectFarmerDeliverySummary>(
      blankSummary,
    );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] =
    useState("");

  const [appliedSearch, setAppliedSearch] =
    useState("");

  const [appliedStatus, setAppliedStatus] =
    useState("");

  const [
    appliedPaymentStatus,
    setAppliedPaymentStatus,
  ] = useState("");

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [formOpen, setFormOpen] = useState(false);

  const [editing, setEditing] =
    useState<DirectFarmerDelivery | null>(null);

  const [viewing, setViewing] =
    useState<DirectFarmerDelivery | null>(null);

  const [confirming, setConfirming] =
    useState<DirectFarmerDelivery | null>(null);

  const [cancelling, setCancelling] =
    useState<DirectFarmerDelivery | null>(null);

  const [cancelReason, setCancelReason] =
    useState("");

  const [paying, setPaying] =
    useState<DirectFarmerDelivery | null>(null);

  const [paymentMethod, setPaymentMethod] =
    useState<FarmerPaymentMethod>("cash");

  const [
    paymentReference,
    setPaymentReference,
  ] = useState("");

  const [paymentProof, setPaymentProof] =
    useState<File | null>(null);

  const [form, setForm] = useState({
    farmer_id: "",
    balance_officer_id: "",
    coffee_type:
      "parchment" as DirectDeliveryCoffeeType,
    quantity_kg: "",
    delivery_date: today(),
    purpose: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [list, totals] = await Promise.all([
        getDirectFarmerDeliveries({
          search: appliedSearch || undefined,

          status: appliedStatus
            ? (appliedStatus as DirectDeliveryStatus)
            : undefined,

          payment_status: appliedPaymentStatus
            ? (
                appliedPaymentStatus as FarmerPaymentStatus
              )
            : undefined,

          page,
          per_page: 15,
        }),

        getDirectFarmerDeliverySummary(),
      ]);

      setDeliveries(list.items);
      setSummary(totals);

      setTotal(list.pagination.total);

      setLastPage(
        Math.max(
          list.pagination.last_page,
          1,
        ),
      );
    } catch (error) {
      setError(message(error));
    } finally {
      setLoading(false);
    }
  }, [
    appliedSearch,
    appliedStatus,
    appliedPaymentStatus,
    page,
  ]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [
          activeFarmers,
          balanceOfficers,
          activeSeason,
        ] = await Promise.all([
          getDirectDeliveryFarmers(),
          getBalanceOfficers(),
          getActiveCoffeeSeasonForAllocation(),
        ]);

        setFarmers(activeFarmers);
        setOfficers(balanceOfficers);
        setSeason(activeSeason);
      } catch (error) {
        setError(message(error));
      }
    }

    void loadOptions();
  }, []);

  function openCreate() {
    setEditing(null);
    setError("");
    setSuccess("");

    setForm({
      farmer_id: "",
      balance_officer_id: "",
      coffee_type: "parchment",
      quantity_kg: "",
      delivery_date: today(),
      purpose: "",
    });

    setFormOpen(true);
  }

  function openEdit(
    delivery: DirectFarmerDelivery,
  ) {
    if (delivery.status !== "draft") {
      return;
    }

    setEditing(delivery);

    setForm({
      farmer_id: String(delivery.farmer_id),
      balance_officer_id: String(
        delivery.balance_officer_id,
      ),
      coffee_type: delivery.coffee_type,
      quantity_kg: String(
        delivery.quantity_kg,
      ),
      delivery_date: delivery.delivery_date,
      purpose: delivery.purpose ?? "",
    });

    setFormOpen(true);
  }

  async function save(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const quantity = Number(form.quantity_kg);

    if (
      !form.farmer_id ||
      !form.balance_officer_id ||
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      setError(
        "Farmer, Balance Officer and quantity are required.",
      );

      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      farmer_id: Number(form.farmer_id),

      balance_officer_id: Number(
        form.balance_officer_id,
      ),

      coffee_type: form.coffee_type,
      quantity_kg: quantity,
      delivery_date: form.delivery_date,
      purpose: form.purpose.trim() || null,
    };

    try {
      if (editing) {
        await updateDirectFarmerDelivery(
          editing.id,
          payload,
        );

        setSuccess(
          "Direct farmer delivery updated.",
        );
      } else {
        await createDirectFarmerDelivery(
          payload,
        );

        setSuccess(
          "Direct farmer delivery created.",
        );
      }

      setFormOpen(false);
      setEditing(null);

      await loadData();
    } catch (error) {
      setError(message(error));
    } finally {
      setSaving(false);
    }
  }

  async function openView(
    delivery: DirectFarmerDelivery,
  ) {
    setViewing(delivery);

    try {
      const result =
        await getDirectFarmerDelivery(
          delivery.id,
        );

      setViewing(result);
    } catch (error) {
      setError(message(error));
    }
  }

  async function confirmDelivery() {
    if (!confirming) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await confirmDirectFarmerDelivery(
        confirming.id,
      );

      setConfirming(null);

      setSuccess(
        "Delivery confirmed successfully.",
      );

      await loadData();
    } catch (error) {
      setError(message(error));
    } finally {
      setSaving(false);
    }
  }

  function openPayment(
    delivery: DirectFarmerDelivery,
  ) {
    setPaying(delivery);

    setPaymentMethod(
      delivery.farmer
        ?.preferred_payment_method ??
        "cash",
    );

    setPaymentReference("");
    setPaymentProof(null);
    setError("");
  }

  async function completePayment() {
    if (!paying) {
      return;
    }

    if (!paymentProof) {
      setError(
        "Payment proof is required.",
      );
      return;
    }

    if (
      paymentMethod !== "cash" &&
      !paymentReference.trim()
    ) {
      setError(
        "Payment reference is required for Mobile Money and Bank payments.",
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      await uploadDirectFarmerPaymentProof(
        paying.id,
        paymentProof,
      );

      await payDirectFarmerDelivery(
        paying.id,
        paymentMethod,
        paymentReference,
      );

      setPaying(null);
      setPaymentProof(null);
      setPaymentReference("");

      setSuccess(
        "Farmer payment recorded successfully.",
      );

      await loadData();
    } catch (error) {
      setError(message(error));
    } finally {
      setSaving(false);
    }
  }

  async function cancelDelivery() {
    if (!cancelling) {
      return;
    }

    const reason = cancelReason.trim();

    if (reason.length < 3) {
      setError(
        "Cancellation reason must contain at least 3 characters.",
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      await cancelDirectFarmerDelivery(
        cancelling.id,
        reason,
      );

      setCancelling(null);
      setCancelReason("");

      setSuccess(
        "Delivery cancelled successfully.",
      );

      await loadData();
    } catch (error) {
      setError(message(error));
    } finally {
      setSaving(false);
    }
  }

  function applyFilters() {
    setAppliedSearch(search.trim());
    setAppliedStatus(status);
    setAppliedPaymentStatus(paymentStatus);
    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setStatus("");
    setPaymentStatus("");

    setAppliedSearch("");
    setAppliedStatus("");
    setAppliedPaymentStatus("");

    setPage(1);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">
            Direct Farmer Deliveries
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-600">
            Manage coffee delivered directly by
            farmers to the washing station.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#075b38] px-5 text-sm font-bold text-white"
        >
          <Plus size={17} />
          New Delivery
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

      <div className="grid grid-cols-2 border-y border-slate-200 md:grid-cols-3 xl:grid-cols-6">
        <Metric
          label="Confirmed Coffee"
          value={`${formatNumber(
            summary.confirmed_quantity_kg,
          )} Kg`}
        />

        <Metric
          label="Confirmed Amount"
          value={money(
            summary.confirmed_amount,
          )}
        />

        <Metric
          label="Paid Amount"
          value={money(summary.paid_amount)}
          strong
        />

        <Metric
          label="Confirmed"
          value={String(
            summary.confirmed_records,
          )}
        />

        <Metric
          label="Draft"
          value={String(
            summary.draft_records,
          )}
        />

        <Metric
          label="Cancelled"
          value={String(
            summary.cancelled_records,
          )}
        />
      </div>

      <div className="grid gap-3 border-y border-slate-200 bg-white py-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Search">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Delivery, farmer..."
              className="h-11 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm text-slate-950 outline-none focus:border-[#075b38]"
            />
          </div>
        </Field>

        <Field label="Delivery Status">
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className={fieldClass}
          >
            <option value="">
              All Statuses
            </option>
            <option value="draft">Draft</option>
            <option value="confirmed">
              Confirmed
            </option>
            <option value="cancelled">
              Cancelled
            </option>
          </select>
        </Field>

        <Field label="Payment Status">
          <select
            value={paymentStatus}
            onChange={(event) =>
              setPaymentStatus(
                event.target.value,
              )
            }
            className={fieldClass}
          >
            <option value="">
              All Payments
            </option>
            <option value="unpaid">
              Unpaid
            </option>
            <option value="paid">
              Paid
            </option>
          </select>
        </Field>

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
          <table className="w-full min-w-[1200px]">
            <thead className="bg-[#fcfbf9]">
              <tr className="border-b text-left text-xs font-bold uppercase text-slate-700">
                <th className="px-4 py-4">
                  Delivery
                </th>
                <th className="px-4 py-4">
                  Farmer
                </th>
                <th className="px-4 py-4">
                  Balance Officer
                </th>
                <th className="px-4 py-4">
                  Coffee
                </th>
                <th className="px-4 py-4">
                  Quantity
                </th>
                <th className="px-4 py-4">
                  Price/Kg
                </th>
                <th className="px-4 py-4">
                  Total
                </th>
                <th className="px-4 py-4">
                  Delivery
                </th>
                <th className="px-4 py-4">
                  Payment
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
              ) : deliveries.length ? (
                deliveries.map((delivery) => (
                  <tr
                    key={delivery.id}
                    className="border-b border-slate-100 text-sm"
                  >
                    <td className="px-4 py-4">
                      <p className="font-bold text-[#80570f]">
                        {delivery.delivery_code}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {delivery.delivery_date}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-950">
                        {delivery.farmer
                          ?.full_name ?? "—"}
                      </p>

                      <p className="text-xs text-slate-500">
                        {delivery.farmer
                          ?.farmer_code ?? "—"}
                      </p>
                    </td>

                    <td className="px-4 py-4 font-semibold text-slate-900">
                      {delivery.balance_officer
                        ?.name ?? "—"}
                    </td>

                    <td className="px-4 py-4">
                      {coffeeName(
                        delivery.coffee_type,
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {formatNumber(
                        delivery.quantity_kg,
                      )}{" "}
                      Kg
                    </td>

                    <td className="px-4 py-4">
                      {money(
                        delivery.price_per_kg,
                      )}
                    </td>

                    <td className="px-4 py-4 font-bold text-slate-950">
                      {money(
                        delivery.total_amount,
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <DeliveryStatus
                        status={delivery.status}
                      />
                    </td>

                    <td className="px-4 py-4">
                      <PaymentStatus
                        status={
                          delivery.payment_status
                        }
                      />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-2">
                        <IconButton
                          title="View"
                          onClick={() =>
                            void openView(
                              delivery,
                            )
                          }
                        >
                          <Eye size={15} />
                        </IconButton>

                        {delivery.status ===
                          "draft" && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                openEdit(
                                  delivery,
                                )
                              }
                              className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-300 px-3 text-xs font-bold"
                            >
                              <Pencil
                                size={14}
                              />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setConfirming(
                                  delivery,
                                )
                              }
                              className="h-8 rounded-md bg-emerald-50 px-3 text-xs font-bold text-emerald-800"
                            >
                              Confirm
                            </button>
                          </>
                        )}

                        {delivery.status ===
                          "confirmed" &&
                          delivery.payment_status ===
                            "unpaid" && (
                            <button
                              type="button"
                              onClick={() =>
                                openPayment(
                                  delivery,
                                )
                              }
                              className="inline-flex h-8 items-center gap-1 rounded-md bg-[#fff4df] px-3 text-xs font-bold text-[#80570f]"
                            >
                              <WalletCards
                                size={14}
                              />
                              Pay
                            </button>
                          )}

                        {delivery.status !==
                          "cancelled" &&
                          delivery.payment_status !==
                            "paid" && (
                            <button
                              type="button"
                              onClick={() => {
                                setCancelling(
                                  delivery,
                                );
                                setCancelReason(
                                  "",
                                );
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
                    colSpan={10}
                    className="py-16 text-center text-sm text-slate-600"
                  >
                    No direct farmer
                    deliveries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t px-4 py-4">
          <p className="text-sm text-slate-600">
            {total} deliveries · Page{" "}
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
              className="flex h-9 w-9 items-center justify-center rounded-md border disabled:opacity-40"
            >
              <ChevronLeft size={17} />
            </button>

            <button
              type="button"
              disabled={page >= lastPage}
              onClick={() =>
                setPage(page + 1)
              }
              className="flex h-9 w-9 items-center justify-center rounded-md border disabled:opacity-40"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {formOpen && (
        <Modal>
          <form
            onSubmit={save}
            className="w-full max-w-2xl rounded-xl bg-white shadow-2xl"
          >
            <ModalHeader
              title={
                editing
                  ? "Edit Direct Delivery"
                  : "New Direct Delivery"
              }
              subtitle="Price and total are calculated automatically by the backend."
              close={() =>
                setFormOpen(false)
              }
            />

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <Field
                label="Farmer"
                required
              >
                <select
                  required
                  value={form.farmer_id}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      farmer_id:
                        event.target.value,
                    })
                  }
                  className={fieldClass}
                >
                  <option value="">
                    Select Farmer
                  </option>

                  {farmers.map((farmer) => (
                    <option
                      key={farmer.id}
                      value={farmer.id}
                    >
                      {farmer.farmer_code} —{" "}
                      {farmer.full_name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Balance Officer"
                required
              >
                <select
                  required
                  value={
                    form.balance_officer_id
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      balance_officer_id:
                        event.target.value,
                    })
                  }
                  className={fieldClass}
                >
                  <option value="">
                    Select Balance Officer
                  </option>

                  {officers.map(
                    (officer) => (
                      <option
                        key={officer.id}
                        value={officer.id}
                      >
                        {officer.name}
                      </option>
                    ),
                  )}
                </select>
              </Field>

              <Field
                label="Coffee Type"
                required
              >
                <select
                  value={
                    form.coffee_type
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      coffee_type:
                        event.target
                          .value as DirectDeliveryCoffeeType,
                    })
                  }
                  className={fieldClass}
                >
                  <option value="cherry">
                    Cherry
                  </option>
                  <option value="parchment">
                    Parchment
                  </option>
                  <option value="green_coffee">
                    Green Coffee
                  </option>
                </select>
              </Field>

              <Field
                label="Quantity (Kg)"
                required
              >
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    form.quantity_kg
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      quantity_kg:
                        event.target.value,
                    })
                  }
                  className={fieldClass}
                />
              </Field>

              <Field
                label="Delivery Date"
                required
              >
                <input
                  required
                  type="date"
                  value={
                    form.delivery_date
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      delivery_date:
                        event.target.value,
                    })
                  }
                  className={fieldClass}
                />
              </Field>

              <div className="flex items-end">
                <div className="w-full border-l-4 border-[#c99a45] bg-[#fffaf2] px-4 py-3">
                  <p className="text-xs font-bold uppercase text-slate-600">
                    Official Price
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-950">
                    The backend finds the
                    active price for this
                    date.
                  </p>
                </div>
              </div>

              <div className="md:col-span-2">
                <Field label="Purpose">
                  <textarea
                    rows={3}
                    value={form.purpose}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        purpose:
                          event.target.value,
                      })
                    }
                    className={
                      textareaClass
                    }
                    placeholder="Optional note about this delivery"
                  />
                </Field>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                type="button"
                onClick={() =>
                  setFormOpen(false)
                }
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
                    : "Create Delivery"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {viewing && (
        <Modal>
          <div className="w-full max-w-4xl rounded-xl bg-white shadow-2xl">
            <ModalHeader
              title="Delivery Details"
              subtitle={
                viewing.delivery_code
              }
              close={() =>
                setViewing(null)
              }
            />

            <div className="grid gap-x-6 px-6 py-2 md:grid-cols-3">
              <Detail
                label="Farmer"
                value={
                  viewing.farmer
                    ?.full_name ?? "—"
                }
              />

              <Detail
                label="Balance Officer"
                value={
                  viewing.balance_officer
                    ?.name ?? "—"
                }
              />

              <Detail
                label="Coffee Type"
                value={coffeeName(
                  viewing.coffee_type,
                )}
              />

              <Detail
                label="Quantity"
                value={`${formatNumber(
                  viewing.quantity_kg,
                )} Kg`}
              />

              <Detail
                label="Price / Kg"
                value={money(
                  viewing.price_per_kg,
                )}
              />

              <Detail
                label="Total Amount"
                value={money(
                  viewing.total_amount,
                )}
              />

              <Detail
                label="Delivery Status"
                value={capitalize(
                  viewing.status,
                )}
              />

              <Detail
                label="Payment Status"
                value={capitalize(
                  viewing.payment_status,
                )}
              />

              <Detail
                label="Delivery Date"
                value={
                  viewing.delivery_date
                }
              />

              <Detail
                label="Payment Method"
                value={
                  viewing.payment_method
                    ? paymentMethodName(
                        viewing.payment_method,
                      )
                    : "—"
                }
              />

              <Detail
                label="Payment Reference"
                value={
                  viewing.payment_reference ??
                  "—"
                }
              />

              <Detail
                label="Payment Proof"
                value={
                  viewing.payment_proof_original_name ??
                  "—"
                }
              />

              <Detail
                label="Confirmed By"
                value={
                  viewing.confirmer?.name ??
                  "—"
                }
              />

              <Detail
                label="Paid By"
                value={
                  viewing.payer?.name ?? "—"
                }
              />

              <Detail
                label="Created By"
                value={
                  viewing.creator?.name ??
                  "—"
                }
              />

              <div className="border-b border-slate-200 py-4 md:col-span-3">
                <p className="text-xs font-bold uppercase text-slate-600">
                  Purpose
                </p>

                <p className="mt-2 text-sm font-medium text-slate-900">
                  {viewing.purpose ||
                    "No purpose provided."}
                </p>
              </div>

              {viewing.cancellation_reason && (
                <div className="border-b border-red-100 bg-red-50/50 px-3 py-4 md:col-span-3">
                  <p className="text-xs font-bold uppercase text-red-700">
                    Cancellation Reason
                  </p>

                  <p className="mt-2 text-sm font-semibold text-red-900">
                    {
                      viewing.cancellation_reason
                    }
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t px-6 py-4">
              <button
                type="button"
                onClick={() =>
                  setViewing(null)
                }
                className="h-10 rounded-lg border border-slate-400 px-5 text-sm font-bold text-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {confirming && (
        <Modal>
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
            <ModalHeader
              title="Confirm Delivery"
              subtitle={
                confirming.delivery_code
              }
              close={() =>
                setConfirming(null)
              }
            />

            <div className="p-5">
              <p className="text-sm font-medium text-slate-800">
                Confirming locks the
                recorded farmer, weight,
                price and amount.
              </p>

              <div className="mt-4 border-l-4 border-[#c99a45] bg-[#fffaf2] px-4 py-3">
                <p className="font-bold text-slate-950">
                  {formatNumber(
                    confirming.quantity_kg,
                  )}{" "}
                  Kg ·{" "}
                  {money(
                    confirming.total_amount,
                  )}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t px-5 py-4">
              <button
                type="button"
                onClick={() =>
                  setConfirming(null)
                }
                className="h-10 rounded-lg border border-slate-400 px-4 text-sm font-bold text-slate-900"
              >
                Not Now
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  void confirmDelivery()
                }
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#075b38] px-4 text-sm font-bold text-white disabled:opacity-50"
              >
                <Check size={16} />
                Confirm Delivery
              </button>
            </div>
          </div>
        </Modal>
      )}

      {paying && (
        <Modal>
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
            <ModalHeader
              title="Record Farmer Payment"
              subtitle={`${paying.delivery_code} · ${money(
                paying.total_amount,
              )}`}
              close={() =>
                setPaying(null)
              }
            />

            <div className="space-y-4 p-6">
              <Field
                label="Payment Method"
                required
              >
                <select
                  value={paymentMethod}
                  onChange={(event) => {
                    setPaymentMethod(
                      event.target
                        .value as FarmerPaymentMethod,
                    );

                    if (
                      event.target.value ===
                      "cash"
                    ) {
                      setPaymentReference(
                        "",
                      );
                    }
                  }}
                  className={fieldClass}
                >
                  <option value="cash">
                    Cash
                  </option>
                  <option value="mobile_money">
                    Mobile Money
                  </option>
                  <option value="bank">
                    Bank Transfer
                  </option>
                </select>
              </Field>

              <Field
                label={`Payment Reference${
                  paymentMethod === "cash"
                    ? " (Optional)"
                    : ""
                }`}
                required={
                  paymentMethod !== "cash"
                }
              >
                <input
                  value={paymentReference}
                  onChange={(event) =>
                    setPaymentReference(
                      event.target.value,
                    )
                  }
                  placeholder={
                    paymentMethod ===
                    "mobile_money"
                      ? "MoMo transaction reference"
                      : paymentMethod ===
                          "bank"
                        ? "Bank transaction reference"
                        : "Optional cash receipt reference"
                  }
                  className={fieldClass}
                />
              </Field>

              <Field
                label="Payment Proof"
                required
              >
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(event) =>
                    setPaymentProof(
                      event.target
                        .files?.[0] ??
                        null,
                    )
                  }
                  className="block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-bold"
                />

                <p className="mt-1 text-xs text-slate-500">
                  JPG, PNG or PDF. Maximum
                  5 MB.
                </p>
              </Field>

              <div className="border-l-4 border-[#075b38] bg-emerald-50 px-4 py-3">
                <p className="text-xs font-bold uppercase text-emerald-800">
                  Amount to Pay
                </p>

                <p className="mt-1 text-xl font-extrabold text-slate-950">
                  {money(
                    paying.total_amount,
                  )}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                type="button"
                onClick={() =>
                  setPaying(null)
                }
                className="h-10 rounded-lg border border-slate-400 px-4 text-sm font-bold text-slate-900"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  void completePayment()
                }
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#075b38] px-4 text-sm font-bold text-white disabled:opacity-50"
              >
                <WalletCards size={16} />

                {saving
                  ? "Processing..."
                  : "Complete Payment"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {cancelling && (
        <Modal>
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
            <ModalHeader
              title="Cancel Delivery"
              subtitle={
                cancelling.delivery_code
              }
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
                  autoFocus
                  value={cancelReason}
                  onChange={(event) =>
                    setCancelReason(
                      event.target.value,
                    )
                  }
                  placeholder="Why is this delivery being cancelled?"
                  className={
                    textareaClass
                  }
                />
              </Field>
            </div>

            <div className="flex justify-end gap-3 border-t px-5 py-4">
              <button
                type="button"
                onClick={() =>
                  setCancelling(null)
                }
                className="h-10 rounded-lg border border-slate-400 px-4 text-sm font-bold text-slate-900"
              >
                Keep Delivery
              </button>

              <button
                type="button"
                disabled={
                  saving ||
                  cancelReason.trim()
                    .length < 3
                }
                onClick={() =>
                  void cancelDelivery()
                }
                className="h-10 rounded-lg bg-red-700 px-4 text-sm font-bold text-white disabled:opacity-50"
              >
                Cancel Delivery
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
      className="flex h-8 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-900"
    >
      {children}
    </button>
  );
}

function DeliveryStatus({
  status,
}: {
  status: DirectDeliveryStatus;
}) {
  const classes =
    status === "confirmed"
      ? "bg-emerald-50 text-emerald-800"
      : status === "cancelled"
        ? "bg-red-50 text-red-700"
        : "bg-amber-50 text-amber-800";

  return (
    <span
      className={`rounded-md px-2.5 py-1 text-xs font-bold capitalize ${classes}`}
    >
      {status}
    </span>
  );
}

function PaymentStatus({
  status,
}: {
  status: FarmerPaymentStatus;
}) {
  const classes =
    status === "paid"
      ? "bg-emerald-50 text-emerald-800"
      : "bg-orange-50 text-orange-800";

  return (
    <span
      className={`rounded-md px-2.5 py-1 text-xs font-bold capitalize ${classes}`}
    >
      {status}
    </span>
  );
}

function coffeeName(
  type: DirectDeliveryCoffeeType,
) {
  if (type === "green_coffee") {
    return "Green Coffee";
  }

  return capitalize(type);
}

function paymentMethodName(
  method: FarmerPaymentMethod,
) {
  if (method === "mobile_money") {
    return "Mobile Money";
  }

  if (method === "bank") {
    return "Bank Transfer";
  }

  return "Cash";
}

function capitalize(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function money(
  value: string | number,
) {
  return `${formatNumber(value)} RWF`;
}

function formatNumber(
  value: string | number,
) {
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

function message(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong.";
}
