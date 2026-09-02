import { apiRequest } from "@/lib/api";

import type {
  DashboardRole,
  EligibleProcessingBatch,
  ProcessingYield,
  ProcessingYieldList,
  ProcessingYieldStatus,
  ProcessingYieldSummary,
} from "@/types/processing-yield";

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

export async function getProcessingYieldRole(): Promise<DashboardRole> {
  const response = await apiRequest<
    ApiResponse<{
      role: DashboardRole;
    }>
  >("/me");

  return unwrap(response).role;
}

export async function getProcessingYields(
  params: {
    search?: string;
    status?: ProcessingYieldStatus;
    output_coffee_type?: string;
    coffee_season_id?: number;
    processing_batch_id?: number;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  } = {},
): Promise<ProcessingYieldList> {
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
    ApiResponse<ProcessingYieldList>
  >(
    `/processing-yields${suffix}`,
  );

  return unwrap(response);
}

export async function getProcessingYieldSummary(): Promise<ProcessingYieldSummary> {
  const response = await apiRequest<
    ApiResponse<ProcessingYieldSummary>
  >(
    "/processing-yields/summary",
  );

  return unwrap(response);
}

export async function getEligibleProcessingBatches(): Promise<
  EligibleProcessingBatch[]
> {
  const response = await apiRequest<
    ApiResponse<{
      items: EligibleProcessingBatch[];
    }>
  >(
    "/processing-yields/eligible-batches",
  );

  return unwrap(response).items;
}

export async function getProcessingYield(
  id: number,
): Promise<ProcessingYield> {
  const response = await apiRequest<
    ApiResponse<ProcessingYield>
  >(
    `/processing-yields/${id}`,
  );

  return unwrap(response);
}

export async function createProcessingYield(
  payload: {
    processing_batch_id: number;
    output_quantity_kg: number;
    output_coffee_type: string;
    output_bag_count?: number;
    yield_date?: string;
    notes?: string;
  },
): Promise<ProcessingYield> {
  const response = await apiRequest<
    ApiResponse<ProcessingYield>
  >(
    "/processing-yields",
    {
      method: "POST",
      body: JSON.stringify(
        payload,
      ),
    },
  );

  return unwrap(response);
}

export async function updateProcessingYield(
  id: number,
  payload: {
    output_quantity_kg?: number;
    output_coffee_type?: string;
    output_bag_count?: number | null;
    yield_date?: string | null;
    notes?: string | null;
  },
): Promise<ProcessingYield> {
  const response = await apiRequest<
    ApiResponse<ProcessingYield>
  >(
    `/processing-yields/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(
        payload,
      ),
    },
  );

  return unwrap(response);
}

export async function confirmProcessingYield(
  id: number,
): Promise<ProcessingYield> {
  const response = await apiRequest<
    ApiResponse<ProcessingYield>
  >(
    `/processing-yields/${id}/confirm`,
    {
      method: "PATCH",
    },
  );

  return unwrap(response);
}

export async function cancelProcessingYield(
  id: number,
  cancellationReason: string,
): Promise<ProcessingYield> {
  const response = await apiRequest<
    ApiResponse<ProcessingYield>
  >(
    `/processing-yields/${id}/cancel`,
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
