import { apiRequest } from "@/lib/api";

import type {
  DashboardRole,
  EligibleCoffeeLot,
  StoreInventory,
  StoreInventoryList,
  StoreInventoryStatus,
  StoreInventorySummary,
} from "@/types/store-inventory";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

function unwrap<T>(
  response: ApiResponse<T> | T,
): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    return (
      response as ApiResponse<T>
    ).data;
  }

  return response as T;
}

export async function getStoreInventoryRole(): Promise<DashboardRole> {
  const response = await apiRequest<
    ApiResponse<{
      role: DashboardRole;
    }>
  >("/me");

  return unwrap(response).role;
}

export async function getStoreInventories(
  params: {
    search?: string;
    status?: StoreInventoryStatus;
    coffee_type?: string;
    coffee_season_id?: number;
    storage_location?: string;
    page?: number;
    per_page?: number;
  } = {},
): Promise<StoreInventoryList> {
  const query = new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== ""
      ) {
        query.set(
          key,
          String(value),
        );
      }
    },
  );

  const suffix = query.toString()
    ? `?${query.toString()}`
    : "";

  const response = await apiRequest<
    ApiResponse<StoreInventoryList>
  >(
    `/store-inventories${suffix}`,
  );

  return unwrap(response);
}

export async function getStoreInventorySummary(): Promise<StoreInventorySummary> {
  const response = await apiRequest<
    ApiResponse<StoreInventorySummary>
  >(
    "/store-inventories/summary",
  );

  return unwrap(response);
}

export async function getStoreInventory(
  id: number,
): Promise<StoreInventory> {
  const response = await apiRequest<
    ApiResponse<StoreInventory>
  >(
    `/store-inventories/${id}`,
  );

  return unwrap(response);
}

export async function getEligibleCoffeeLots(): Promise<
  EligibleCoffeeLot[]
> {
  const response = await apiRequest<
    ApiResponse<{
      items: EligibleCoffeeLot[];
    }>
  >(
    "/store-inventories/eligible-lots",
  );

  return unwrap(response).items;
}

export async function createStoreInventory(
  payload: {
    coffee_lot_id: number;
    storage_location: string;
    bag_count?: number;
    received_at?: string;
    notes?: string;
  },
): Promise<StoreInventory> {
  const response = await apiRequest<
    ApiResponse<StoreInventory>
  >(
    "/store-inventories",
    {
      method: "POST",

      body: JSON.stringify(
        payload,
      ),
    },
  );

  return unwrap(response);
}

export async function updateStoreInventory(
  id: number,
  payload: {
    storage_location?: string;
    bag_count?: number | null;
    notes?: string | null;
  },
): Promise<StoreInventory> {
  const response = await apiRequest<
    ApiResponse<StoreInventory>
  >(
    `/store-inventories/${id}`,
    {
      method: "PUT",

      body: JSON.stringify(
        payload,
      ),
    },
  );

  return unwrap(response);
}

export async function cancelStoreInventory(
  id: number,
  cancellationReason: string,
): Promise<StoreInventory> {
  const response = await apiRequest<
    ApiResponse<StoreInventory>
  >(
    `/store-inventories/${id}/cancel`,
    {
      method: "PATCH",

      body: JSON.stringify({
        cancellation_reason:
          cancellationReason,
      }),
    },
  );

  return unwrap(response);
}
