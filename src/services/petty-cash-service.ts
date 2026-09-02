import { apiRequest } from "@/lib/api";

import type {
  DashboardRole,
  PettyCashList,
  PettyCashStatus,
  PettyCashSummary,
  PettyCashTransaction,
  PettyCashTransactionType,
} from "@/types/petty-cash";

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

export async function getPettyCashRole(): Promise<DashboardRole> {
  const response = await apiRequest<
    ApiResponse<{
      role: DashboardRole;
    }>
  >("/me");

  return unwrap(response).role;
}

export async function getPettyCashTransactions(
  params: {
    search?: string;
    transaction_type?: PettyCashTransactionType;
    status?: PettyCashStatus;
    category?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  } = {},
): Promise<PettyCashList> {
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
    ApiResponse<PettyCashList>
  >(`/petty-cash${suffix}`);

  return unwrap(response);
}

export async function getPettyCashSummary(): Promise<PettyCashSummary> {
  const response = await apiRequest<
    ApiResponse<PettyCashSummary>
  >("/petty-cash/summary");

  return unwrap(response);
}

export async function getPettyCashTransaction(
  id: number,
): Promise<PettyCashTransaction> {
  const response = await apiRequest<
    ApiResponse<PettyCashTransaction>
  >(`/petty-cash/${id}`);

  return unwrap(response);
}

export async function createPettyCashTransaction(
  payload: {
    transaction_date: string;
    transaction_type: "fund_in" | "expense";
    amount: number;
    category?: string;
    counterparty_name: string;
    purpose: string;
    reference_number?: string;
    receipt_number?: string;
    notes?: string;
  },
): Promise<PettyCashTransaction> {
  const response = await apiRequest<
    ApiResponse<PettyCashTransaction>
  >(
    "/petty-cash",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return unwrap(response);
}

export async function reversePettyCashTransaction(
  id: number,
  reversalReason: string,
): Promise<PettyCashTransaction> {
  const response = await apiRequest<
    ApiResponse<PettyCashTransaction>
  >(
    `/petty-cash/${id}/reverse`,
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
