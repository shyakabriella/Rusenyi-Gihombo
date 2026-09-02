import {
  apiRequest,
} from "@/lib/api";

import type {
  Agent,
  AgentCreatePayload,
  AgentListResponse,
  AgentStatus,
  AgentUpdatePayload,
  AgentUserListResponse,
} from "@/types/agent";

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

export type AgentListParams = {
  search?: string;

  status?: AgentStatus;

  province_id?: number;

  district_id?: number;

  sector_id?: number;

  cell_id?: number;

  village_id?: number;

  page?: number;

  per_page?: number;
};

export async function getAgents(
  params: AgentListParams = {},
): Promise<AgentListResponse> {
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

  if (params.province_id) {
    query.set(
      "province_id",
      String(
        params.province_id,
      ),
    );
  }

  if (params.district_id) {
    query.set(
      "district_id",
      String(
        params.district_id,
      ),
    );
  }

  if (params.sector_id) {
    query.set(
      "sector_id",
      String(
        params.sector_id,
      ),
    );
  }

  if (params.cell_id) {
    query.set(
      "cell_id",
      String(
        params.cell_id,
      ),
    );
  }

  if (params.village_id) {
    query.set(
      "village_id",
      String(
        params.village_id,
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
      params.per_page ?? 20,
    ),
  );

  const response =
    await apiRequest<
      Envelope<AgentListResponse>
    >(
      `/admin/agents?${query.toString()}`,
    );

  return unwrap(response);
}

export async function getAgent(
  id: number,
): Promise<Agent> {
  const response =
    await apiRequest<
      Envelope<Agent>
    >(
      `/admin/agents/${id}`,
    );

  return unwrap(response);
}

export async function createAgent(
  payload: AgentCreatePayload,
): Promise<Agent> {
  const response =
    await apiRequest<
      Envelope<Agent>
    >(
      "/admin/agents",
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

export async function updateAgent(
  id: number,
  payload: AgentUpdatePayload,
): Promise<Agent> {
  const response =
    await apiRequest<
      Envelope<Agent>
    >(
      `/admin/agents/${id}`,
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

export async function deactivateAgent(
  id: number,
): Promise<Agent> {
  const response =
    await apiRequest<
      Envelope<Agent>
    >(
      `/admin/agents/${id}/deactivate`,
      {
        method: "PATCH",
      },
    );

  return unwrap(response);
}

export async function reactivateAgent(
  id: number,
): Promise<Agent> {
  const response =
    await apiRequest<
      Envelope<Agent>
    >(
      `/admin/agents/${id}/reactivate`,
      {
        method: "PATCH",
      },
    );

  return unwrap(response);
}

export async function getActiveAgentUsers(): Promise<AgentUserListResponse> {
  const response =
    await apiRequest<
      Envelope<AgentUserListResponse>
    >(
      "/admin/users?role=agent&status=active&per_page=100",
    );

  return unwrap(response);
}
