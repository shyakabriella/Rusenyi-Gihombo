import { apiRequest } from "@/lib/api";

import type {
  DashboardRole,
  ProcessingBatch,
  ProcessingBatchList,
  ProcessingBatchStatus,
  ProcessingBatchSummary,
  ProcessingInventory,
} from "@/types/processing-batch";

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

export async function getProcessingRole(): Promise<DashboardRole> {
  const response = await apiRequest<
    ApiResponse<{
      role: DashboardRole;
    }>
  >("/me");

  return unwrap(response).role;
}

export async function getProcessingBatches(
  params: {
    search?: string;
    status?: ProcessingBatchStatus;
    process_name?: string;
    coffee_season_id?: number;
    coffee_lot_id?: number;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  } = {},
): Promise<ProcessingBatchList> {
  const query =
    new URLSearchParams();

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

  const suffix =
    query.toString()
      ? `?${query.toString()}`
      : "";

  const response = await apiRequest<
    ApiResponse<ProcessingBatchList>
  >(
    `/processing-batches${suffix}`,
  );

  return unwrap(response);
}

export async function getProcessingSummary(): Promise<ProcessingBatchSummary> {
  const response = await apiRequest<
    ApiResponse<ProcessingBatchSummary>
  >(
    "/processing-batches/summary",
  );

  return unwrap(response);
}

export async function getProcessingBatch(
  id: number,
): Promise<ProcessingBatch> {
  const response = await apiRequest<
    ApiResponse<ProcessingBatch>
  >(
    `/processing-batches/${id}`,
  );

  return unwrap(response);
}

export async function getProcessingInventoryLookup(): Promise<
  ProcessingInventory[]
> {
  const response = await apiRequest<
    ApiResponse<{
      items: ProcessingInventory[];
    }>
  >(
    "/processing-batches/inventory-lookup",
  );

  return unwrap(response).items;
}

export async function createProcessingBatch(
  payload: {
    store_inventory_id: number;
    process_name: string;
    input_quantity_kg: number;
    planned_start_at?: string;
    notes?: string;
  },
): Promise<ProcessingBatch> {
  const response = await apiRequest<
    ApiResponse<ProcessingBatch>
  >(
    "/processing-batches",
    {
      method: "POST",

      body: JSON.stringify(
        payload,
      ),
    },
  );

  return unwrap(response);
}

export async function updateProcessingBatch(
  id: number,
  payload: {
    process_name?: string;
    input_quantity_kg?: number;
    planned_start_at?: string | null;
    notes?: string | null;
  },
): Promise<ProcessingBatch> {
  const response = await apiRequest<
    ApiResponse<ProcessingBatch>
  >(
    `/processing-batches/${id}`,
    {
      method: "PUT",

      body: JSON.stringify(
        payload,
      ),
    },
  );

  return unwrap(response);
}

export async function startProcessingBatch(
  id: number,
): Promise<ProcessingBatch> {
  const response = await apiRequest<
    ApiResponse<ProcessingBatch>
  >(
    `/processing-batches/${id}/start`,
    {
      method: "PATCH",
    },
  );

  return unwrap(response);
}

export async function completeProcessingBatch(
  id: number,
): Promise<ProcessingBatch> {
  const response = await apiRequest<
    ApiResponse<ProcessingBatch>
  >(
    `/processing-batches/${id}/complete`,
    {
      method: "PATCH",
    },
  );

  return unwrap(response);
}

export async function cancelProcessingBatch(
  id: number,
  cancellationReason: string,
): Promise<ProcessingBatch> {
  const response = await apiRequest<
    ApiResponse<ProcessingBatch>
  >(
    `/processing-batches/${id}/cancel`,
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
