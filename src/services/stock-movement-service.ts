import { apiRequest } from "@/lib/api";

import type {
  DashboardRole,
  StockMovement,
  StockMovementInventory,
  StockMovementList,
  StockMovementStatus,
  StockMovementSummary,
  StockMovementType,
} from "@/types/stock-movement";

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

export async function getStockMovementRole(): Promise<DashboardRole> {
  const response = await apiRequest<
    ApiResponse<{
      role: DashboardRole;
    }>
  >("/me");

  return unwrap(response).role;
}

export async function getStockMovements(
  params: {
    search?: string;
    movement_type?: StockMovementType;
    status?: StockMovementStatus;
    store_inventory_id?: number;
    coffee_lot_id?: number;
    coffee_season_id?: number;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  } = {},
): Promise<StockMovementList> {
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
    ApiResponse<StockMovementList>
  >(`/stock-movements${suffix}`);

  return unwrap(response);
}

export async function getStockMovementSummary(): Promise<StockMovementSummary> {
  const response = await apiRequest<
    ApiResponse<StockMovementSummary>
  >("/stock-movements/summary");

  return unwrap(response);
}

export async function getStockMovement(
  id: number,
): Promise<StockMovement> {
  const response = await apiRequest<
    ApiResponse<StockMovement>
  >(`/stock-movements/${id}`);

  return unwrap(response);
}

export async function getStockInventoryLookup(): Promise<
  StockMovementInventory[]
> {
  const response = await apiRequest<
    ApiResponse<{
      items: StockMovementInventory[];
    }>
  >(
    "/stock-movements/inventory-lookup",
  );

  return unwrap(response).items;
}

export async function createStockMovement(
  payload: {
    store_inventory_id: number;
    movement_type: Exclude<
      StockMovementType,
      "reversal"
    >;
    quantity_kg?: number;
    to_location?: string;
    reference_type?: string;
    reference_id?: number;
    reason: string;
    notes?: string;
  },
): Promise<StockMovement> {
  const response = await apiRequest<
    ApiResponse<StockMovement>
  >(
    "/stock-movements",
    {
      method: "POST",

      body: JSON.stringify(
        payload,
      ),
    },
  );

  return unwrap(response);
}

export async function reverseStockMovement(
  id: number,
  reversalReason: string,
): Promise<StockMovement> {
  const response = await apiRequest<
    ApiResponse<StockMovement>
  >(
    `/stock-movements/${id}/reverse`,
    {
      method: "PATCH",

      body: JSON.stringify({
        reversal_reason:
          reversalReason,
      }),
    },
  );

  return unwrap(response);
}
