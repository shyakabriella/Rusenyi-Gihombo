import { apiRequest } from "@/lib/api";

import type {
  CoffeePurchase,
  CoffeePurchaseList,
  CoffeePurchasePayload,
  CoffeePurchaseStatus,
  CoffeePurchaseSummary,
  CoffeeType,
  PurchaseFarmer,
} from "@/types/coffee-purchase";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

function data<T>(response: ApiResponse<T> | T): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    return (response as ApiResponse<T>).data;
  }

  return response as T;
}

export async function getCoffeePurchases(
  params: {
    search?: string;
    status?: CoffeePurchaseStatus;
    coffee_type?: CoffeeType;
    agent_id?: number;
    farmer_id?: number;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  } = {},
): Promise<CoffeePurchaseList> {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  const response = await apiRequest<
    ApiResponse<CoffeePurchaseList>
  >(
    `/coffee-purchases?${query.toString()}`,
  );

  return data(response);
}

export async function getCoffeePurchaseSummary(): Promise<CoffeePurchaseSummary> {
  const response = await apiRequest<
    ApiResponse<CoffeePurchaseSummary>
  >("/coffee-purchases/summary");

  return data(response);
}

export async function getCoffeePurchase(
  id: number,
): Promise<CoffeePurchase> {
  const response = await apiRequest<
    ApiResponse<CoffeePurchase>
  >(`/coffee-purchases/${id}`);

  return data(response);
}

export async function createCoffeePurchase(
  payload: CoffeePurchasePayload,
): Promise<CoffeePurchase> {
  const response = await apiRequest<
    ApiResponse<CoffeePurchase>
  >(
    "/coffee-purchases",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return data(response);
}

export async function updateCoffeePurchase(
  id: number,
  payload: CoffeePurchasePayload,
): Promise<CoffeePurchase> {
  const response = await apiRequest<
    ApiResponse<CoffeePurchase>
  >(
    `/coffee-purchases/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );

  return data(response);
}

export async function approveCoffeePurchase(
  id: number,
): Promise<CoffeePurchase> {
  const response = await apiRequest<
    ApiResponse<CoffeePurchase>
  >(
    `/coffee-purchases/${id}/approve`,
    {
      method: "PATCH",
    },
  );

  return data(response);
}

export async function cancelCoffeePurchase(
  id: number,
  reason: string,
): Promise<CoffeePurchase> {
  const response = await apiRequest<
    ApiResponse<CoffeePurchase>
  >(
    `/coffee-purchases/${id}/cancel`,
    {
      method: "PATCH",
      body: JSON.stringify({
        cancellation_reason: reason,
      }),
    },
  );

  return data(response);
}

export async function getPurchaseFarmers(): Promise<
  PurchaseFarmer[]
> {
  const response = await apiRequest<
    ApiResponse<{
      items: PurchaseFarmer[];
    }>
  >("/farmers/lookup");

  return data(response).items;
}
