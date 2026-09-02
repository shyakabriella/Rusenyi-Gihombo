import {
  apiRequest,
} from "@/lib/api";

import type {
  ActiveCoffeeSeason,
  CashAllocation,
  CashAllocationAgent,
  CashAllocationListResponse,
  CashAllocationPayload,
  CashAllocationStatus,
  CashAllocationSummary,
} from "@/types/cash-allocation";

type Envelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

function unwrap<T>(
  response:
    | T
    | Envelope<T>,
): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    return (
      response as Envelope<T>
    ).data;
  }

  return response as T;
}

export async function getCashAllocations(
  params: {
    search?: string;
    status?: CashAllocationStatus;
    agent_id?: number;
    page?: number;
    per_page?: number;
  } = {},
): Promise<CashAllocationListResponse> {
  const query =
    new URLSearchParams();

  if (params.search) {
    query.set(
      "search",
      params.search,
    );
  }

  if (params.status) {
    query.set(
      "status",
      params.status,
    );
  }

  if (params.agent_id) {
    query.set(
      "agent_id",
      String(
        params.agent_id,
      ),
    );
  }

  query.set(
    "page",
    String(
      params.page ?? 1,
    ),
  );

  query.set(
    "per_page",
    String(
      params.per_page ?? 10,
    ),
  );

  const response =
    await apiRequest<
      Envelope<CashAllocationListResponse>
    >(
      `/finance/cash-allocations?${query.toString()}`,
    );

  return unwrap(response);
}

export async function getCashAllocationSummary(): Promise<CashAllocationSummary> {
  const response =
    await apiRequest<
      Envelope<CashAllocationSummary>
    >(
      "/finance/cash-allocations/summary",
    );

  return unwrap(response);
}

export async function getCashAllocation(
  id: number,
): Promise<CashAllocation> {
  const response =
    await apiRequest<
      Envelope<CashAllocation>
    >(
      `/finance/cash-allocations/${id}`,
    );

  return unwrap(response);
}

export async function createCashAllocation(
  payload: CashAllocationPayload,
): Promise<CashAllocation> {
  const response =
    await apiRequest<
      Envelope<CashAllocation>
    >(
      "/finance/cash-allocations",
      {
        method: "POST",

        body:
          JSON.stringify(
            payload,
          ),
      },
    );

  return unwrap(response);
}

export async function updateCashAllocation(
  id: number,
  payload: CashAllocationPayload,
): Promise<CashAllocation> {
  const response =
    await apiRequest<
      Envelope<CashAllocation>
    >(
      `/finance/cash-allocations/${id}`,
      {
        method: "PUT",

        body:
          JSON.stringify(
            payload,
          ),
      },
    );

  return unwrap(response);
}

export async function uploadCashAllocationProof(
  id: number,
  file: File,
): Promise<CashAllocation> {
  const formData =
    new FormData();

  formData.append(
    "payment_proof",
    file,
  );

  /*
   * IMPORTANT:
   * Do NOT manually set Content-Type.
   * Browser must generate the multipart boundary.
   */
  const response =
    await apiRequest<
      Envelope<CashAllocation>
    >(
      `/finance/cash-allocations/${id}/proof`,
      {
        method: "POST",

        body:
          formData,
      },
    );

  return unwrap(response);
}

export async function approveCashAllocation(
  id: number,
): Promise<CashAllocation> {
  const response =
    await apiRequest<
      Envelope<CashAllocation>
    >(
      `/finance/cash-allocations/${id}/approve`,
      {
        method: "PATCH",
      },
    );

  return unwrap(response);
}

export async function cancelCashAllocation(
  id: number,
  reason: string,
): Promise<CashAllocation> {
  const response =
    await apiRequest<
      Envelope<CashAllocation>
    >(
      `/finance/cash-allocations/${id}/cancel`,
      {
        method: "PATCH",

        body:
          JSON.stringify({
            cancellation_reason:
              reason,
          }),
      },
    );

  return unwrap(response);
}

export async function getActiveAgentsForAllocation(): Promise<CashAllocationAgent[]> {
  const response =
    await apiRequest<
      Envelope<{
        items:
          CashAllocationAgent[];
      }>
    >(
      "/agents/lookup",
    );

  return unwrap(
    response,
  ).items;
}

export async function getActiveCoffeeSeasonForAllocation(): Promise<ActiveCoffeeSeason | null> {
  const response =
    await apiRequest<
      Envelope<
        ActiveCoffeeSeason | null
      >
    >(
      "/coffee-seasons/active",
    );

  return unwrap(response);
}
