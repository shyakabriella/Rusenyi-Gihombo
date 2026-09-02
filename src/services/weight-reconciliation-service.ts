import { apiRequest } from "@/lib/api";

import type {
  DashboardRole,
  EligibleFactoryReception,
  WeightReconciliation,
  WeightReconciliationList,
  WeightReconciliationOutcome,
  WeightReconciliationStatus,
  WeightReconciliationSummary,
} from "@/types/weight-reconciliation";

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

export async function getWeightReconciliationRole(): Promise<DashboardRole> {
  const response = await apiRequest<
    ApiResponse<{
      role: DashboardRole;
    }>
  >("/me");

  return unwrap(response).role;
}

export async function getWeightReconciliations(
  params: {
    search?: string;
    status?: WeightReconciliationStatus;
    outcome?: WeightReconciliationOutcome;
    coffee_season_id?: number;
    agent_id?: number;
    page?: number;
    per_page?: number;
  } = {},
): Promise<WeightReconciliationList> {
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
    ApiResponse<WeightReconciliationList>
  >(
    `/weight-reconciliations${suffix}`,
  );

  return unwrap(response);
}

export async function getWeightReconciliationSummary(): Promise<WeightReconciliationSummary> {
  const response = await apiRequest<
    ApiResponse<WeightReconciliationSummary>
  >(
    "/weight-reconciliations/summary",
  );

  return unwrap(response);
}

export async function getWeightReconciliation(
  id: number,
): Promise<WeightReconciliation> {
  const response = await apiRequest<
    ApiResponse<WeightReconciliation>
  >(
    `/weight-reconciliations/${id}`,
  );

  return unwrap(response);
}

export async function getEligibleFactoryReceptions(): Promise<
  EligibleFactoryReception[]
> {
  const response = await apiRequest<
    ApiResponse<{
      items: EligibleFactoryReception[];
    }>
  >(
    "/weight-reconciliations/eligible-receptions",
  );

  return unwrap(response).items;
}

export async function createWeightReconciliation(
  payload: {
    factory_reception_id: number;
    tolerance_percentage?: number;
    notes?: string;
  },
): Promise<WeightReconciliation> {
  const response = await apiRequest<
    ApiResponse<WeightReconciliation>
  >(
    "/weight-reconciliations",
    {
      method: "POST",

      body: JSON.stringify(
        payload,
      ),
    },
  );

  return unwrap(response);
}

export async function updateWeightReconciliation(
  id: number,
  payload: {
    tolerance_percentage?: number;
    notes?: string | null;
  },
): Promise<WeightReconciliation> {
  const response = await apiRequest<
    ApiResponse<WeightReconciliation>
  >(
    `/weight-reconciliations/${id}`,
    {
      method: "PUT",

      body: JSON.stringify(
        payload,
      ),
    },
  );

  return unwrap(response);
}

export async function reconcileWeightReconciliation(
  id: number,
): Promise<WeightReconciliation> {
  const response = await apiRequest<
    ApiResponse<WeightReconciliation>
  >(
    `/weight-reconciliations/${id}/reconcile`,
    {
      method: "PATCH",
    },
  );

  return unwrap(response);
}

export async function cancelWeightReconciliation(
  id: number,
  cancellationReason: string,
): Promise<WeightReconciliation> {
  const response = await apiRequest<
    ApiResponse<WeightReconciliation>
  >(
    `/weight-reconciliations/${id}/cancel`,
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
