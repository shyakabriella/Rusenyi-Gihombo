import { apiRequest } from "@/lib/api";

import type {
  AgentCollection,
  AgentCollectionList,
  AgentCollectionStatus,
  AgentCollectionSummary,
  EligibleCollectionPurchase,
} from "@/types/agent-collection";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

function data<T>(
  response: ApiResponse<T> | T,
): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    return (response as ApiResponse<T>).data;
  }

  return response as T;
}

export async function getAgentCollections(
  params: {
    search?: string;
    status?: AgentCollectionStatus;
    agent_id?: number;
    coffee_season_id?: number;
    page?: number;
    per_page?: number;
  } = {},
): Promise<AgentCollectionList> {
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

  return data(
    await apiRequest<
      ApiResponse<AgentCollectionList>
    >(`/agent-collections${suffix}`),
  );
}

export async function getAgentCollectionSummary(
  seasonId?: number,
): Promise<AgentCollectionSummary> {
  const suffix = seasonId
    ? `?coffee_season_id=${seasonId}`
    : "";

  return data(
    await apiRequest<
      ApiResponse<AgentCollectionSummary>
    >(
      `/agent-collections/summary${suffix}`,
    ),
  );
}

export async function getAgentCollection(
  id: number,
): Promise<AgentCollection> {
  return data(
    await apiRequest<
      ApiResponse<AgentCollection>
    >(`/agent-collections/${id}`),
  );
}

export async function createAgentCollection(
  payload: {
    agent_id: number;
    collection_date: string;
    notes?: string | null;
  },
): Promise<AgentCollection> {
  return data(
    await apiRequest<
      ApiResponse<AgentCollection>
    >("/agent-collections", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  );
}

export async function updateAgentCollection(
  id: number,
  payload: {
    collection_date: string;
    collection_point_id?: number | null;
    notes?: string | null;
  },
): Promise<AgentCollection> {
  return data(
    await apiRequest<
      ApiResponse<AgentCollection>
    >(`/agent-collections/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  );
}

export async function getEligibleCollectionPurchases(
  agentId: number,
  seasonId: number,
): Promise<EligibleCollectionPurchase[]> {
  const query = new URLSearchParams({
    agent_id: String(agentId),
    coffee_season_id:
      String(seasonId),
  });

  const response = await apiRequest<
    ApiResponse<{
      items: EligibleCollectionPurchase[];
    }>
  >(
    `/agent-collections/eligible-purchases?${query.toString()}`,
  );

  return data(response).items;
}

export async function addAgentCollectionPurchases(
  collectionId: number,
  purchaseIds: number[],
): Promise<AgentCollection> {
  return data(
    await apiRequest<
      ApiResponse<AgentCollection>
    >(
      `/agent-collections/${collectionId}/purchases`,
      {
        method: "POST",
        body: JSON.stringify({
          purchase_ids: purchaseIds,
        }),
      },
    ),
  );
}

export async function removeAgentCollectionPurchase(
  collectionId: number,
  purchaseId: number,
): Promise<AgentCollection> {
  return data(
    await apiRequest<
      ApiResponse<AgentCollection>
    >(
      `/agent-collections/${collectionId}/purchases/${purchaseId}`,
      {
        method: "DELETE",
      },
    ),
  );
}

export async function completeAgentCollection(
  id: number,
): Promise<AgentCollection> {
  return data(
    await apiRequest<
      ApiResponse<AgentCollection>
    >(`/agent-collections/${id}/complete`, {
      method: "PATCH",
    }),
  );
}

export async function cancelAgentCollection(
  id: number,
  reason: string,
): Promise<AgentCollection> {
  return data(
    await apiRequest<
      ApiResponse<AgentCollection>
    >(`/agent-collections/${id}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({
        cancellation_reason: reason,
      }),
    }),
  );
}

export async function getCurrentDashboardRole(): Promise<string> {
  const response = await apiRequest<
    ApiResponse<{
      role: string;
    }>
  >("/me");

  return data(response).role;
}
