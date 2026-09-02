import { apiRequest } from "@/lib/api";

import type {
  BalanceOfficer,
  DirectDeliveryCoffeeType,
  DirectDeliveryFarmer,
  DirectDeliveryStatus,
  DirectFarmerDelivery,
  DirectFarmerDeliveryList,
  DirectFarmerDeliveryPayload,
  DirectFarmerDeliverySummary,
  FarmerPaymentMethod,
  FarmerPaymentStatus,
} from "@/types/direct-farmer-delivery";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

function getData<T>(response: ApiResponse<T> | T): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    return (response as ApiResponse<T>).data;
  }

  return response as T;
}

export async function getDirectFarmerDeliveries(
  params: {
    search?: string;
    status?: DirectDeliveryStatus;
    payment_status?: FarmerPaymentStatus;
    coffee_type?: DirectDeliveryCoffeeType;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  } = {},
): Promise<DirectFarmerDeliveryList> {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  const suffix = query.toString()
    ? `?${query.toString()}`
    : "";

  const response = await apiRequest<
    ApiResponse<DirectFarmerDeliveryList>
  >(`/direct-farmer-deliveries${suffix}`);

  return getData(response);
}

export async function getDirectFarmerDeliverySummary(): Promise<DirectFarmerDeliverySummary> {
  const response = await apiRequest<
    ApiResponse<DirectFarmerDeliverySummary>
  >("/direct-farmer-deliveries/summary");

  return getData(response);
}

export async function getDirectFarmerDelivery(
  id: number,
): Promise<DirectFarmerDelivery> {
  const response = await apiRequest<
    ApiResponse<DirectFarmerDelivery>
  >(`/direct-farmer-deliveries/${id}`);

  return getData(response);
}

export async function createDirectFarmerDelivery(
  payload: DirectFarmerDeliveryPayload,
): Promise<DirectFarmerDelivery> {
  const response = await apiRequest<
    ApiResponse<DirectFarmerDelivery>
  >("/direct-farmer-deliveries", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return getData(response);
}

export async function updateDirectFarmerDelivery(
  id: number,
  payload: DirectFarmerDeliveryPayload,
): Promise<DirectFarmerDelivery> {
  const response = await apiRequest<
    ApiResponse<DirectFarmerDelivery>
  >(`/direct-farmer-deliveries/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return getData(response);
}

export async function confirmDirectFarmerDelivery(
  id: number,
): Promise<DirectFarmerDelivery> {
  const response = await apiRequest<
    ApiResponse<DirectFarmerDelivery>
  >(`/direct-farmer-deliveries/${id}/confirm`, {
    method: "PATCH",
  });

  return getData(response);
}

export async function cancelDirectFarmerDelivery(
  id: number,
  cancellationReason: string,
): Promise<DirectFarmerDelivery> {
  const response = await apiRequest<
    ApiResponse<DirectFarmerDelivery>
  >(`/direct-farmer-deliveries/${id}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({
      cancellation_reason: cancellationReason,
    }),
  });

  return getData(response);
}

export async function uploadDirectFarmerPaymentProof(
  id: number,
  file: File,
): Promise<DirectFarmerDelivery> {
  const formData = new FormData();

  formData.append("payment_proof", file);

  const response = await apiRequest<
    ApiResponse<DirectFarmerDelivery>
  >(
    `/direct-farmer-deliveries/${id}/payment-proof`,
    {
      method: "POST",
      body: formData,
    },
  );

  return getData(response);
}

export async function payDirectFarmerDelivery(
  id: number,
  paymentMethod: FarmerPaymentMethod,
  paymentReference?: string,
): Promise<DirectFarmerDelivery> {
  const response = await apiRequest<
    ApiResponse<DirectFarmerDelivery>
  >(`/direct-farmer-deliveries/${id}/pay`, {
    method: "PATCH",
    body: JSON.stringify({
      payment_method: paymentMethod,
      payment_reference:
        paymentReference?.trim() || null,
    }),
  });

  return getData(response);
}

export async function getDirectDeliveryFarmers(): Promise<
  DirectDeliveryFarmer[]
> {
  const response = await apiRequest<
    ApiResponse<{
      items: DirectDeliveryFarmer[];
    }>
  >("/farmers/lookup");

  return getData(response).items;
}

export async function getBalanceOfficers(): Promise<
  BalanceOfficer[]
> {
  const response = await apiRequest<
    ApiResponse<{
      items: BalanceOfficer[];
    }>
  >(
    "/direct-farmer-deliveries/balance-officers",
  );

  return getData(response).items;
}
