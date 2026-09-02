import { apiRequest } from "@/lib/api";

import type {
  AgentWalletDetail,
  AgentWalletFinanceSummary,
  AgentWalletListResponse,
  AgentWalletTransactionListResponse,
} from "@/types/agent-wallet";

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

export async function getAgentWallets(
  params: {
    search?: string;
    status?: string;
    coffee_season_id?: number;
    page?: number;
    per_page?: number;
  } = {},
): Promise<AgentWalletListResponse> {
  const query = new URLSearchParams();

  if (params.search) {
    query.set("search", params.search);
  }

  if (params.status) {
    query.set("status", params.status);
  }

  if (params.coffee_season_id) {
    query.set(
      "coffee_season_id",
      String(params.coffee_season_id),
    );
  }

  query.set(
    "page",
    String(params.page ?? 1),
  );

  query.set(
    "per_page",
    String(params.per_page ?? 15),
  );

  const response =
    await apiRequest<
      ApiResponse<AgentWalletListResponse>
    >(
      `/finance/agent-wallets?${query.toString()}`,
    );

  return getData(response);
}

export async function getAgentWalletSummary(
  coffeeSeasonId?: number,
): Promise<AgentWalletFinanceSummary> {
  const query = new URLSearchParams();

  if (coffeeSeasonId) {
    query.set(
      "coffee_season_id",
      String(coffeeSeasonId),
    );
  }

  const url =
    query.toString()
      ? `/finance/agent-wallets/summary?${query.toString()}`
      : "/finance/agent-wallets/summary";

  const response =
    await apiRequest<
      ApiResponse<AgentWalletFinanceSummary>
    >(url);

  return getData(response);
}

export async function getAgentWallet(
  agentId: number,
  coffeeSeasonId?: number,
): Promise<AgentWalletDetail> {
  const query = new URLSearchParams();

  if (coffeeSeasonId) {
    query.set(
      "coffee_season_id",
      String(coffeeSeasonId),
    );
  }

  const url =
    query.toString()
      ? `/finance/agent-wallets/${agentId}?${query.toString()}`
      : `/finance/agent-wallets/${agentId}`;

  const response =
    await apiRequest<
      ApiResponse<AgentWalletDetail>
    >(url);

  return getData(response);
}

export async function getAgentWalletTransactions(
  agentId: number,
  params: {
    coffee_season_id?: number;
    direction?: string;
    page?: number;
    per_page?: number;
  } = {},
): Promise<AgentWalletTransactionListResponse> {
  const query = new URLSearchParams();

  if (params.coffee_season_id) {
    query.set(
      "coffee_season_id",
      String(params.coffee_season_id),
    );
  }

  if (params.direction) {
    query.set(
      "direction",
      params.direction,
    );
  }

  query.set(
    "page",
    String(params.page ?? 1),
  );

  query.set(
    "per_page",
    String(params.per_page ?? 20),
  );

  const response =
    await apiRequest<
      ApiResponse<AgentWalletTransactionListResponse>
    >(
      `/finance/agent-wallets/${agentId}/transactions?${query.toString()}`,
    );

  return getData(response);
}
