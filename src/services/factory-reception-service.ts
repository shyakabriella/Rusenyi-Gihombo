import { apiRequest } from "@/lib/api";
import type {
  FactoryReception,
  FactoryReceptionList,
  FactoryReceptionStatus,
  FactoryReceptionSummary,
} from "@/types/factory-reception";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

function data<T>(response: ApiResponse<T> | T): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    return (response as ApiResponse<T>).data;
  }

  return response as T;
}

export async function getFactoryReceptions(
  params: {
    search?: string;
    status?: FactoryReceptionStatus;
    agent_id?: number;
    coffee_season_id?: number;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  } = {},
): Promise<FactoryReceptionList> {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  const suffix = query.toString()
    ? `?${query.toString()}`
    : "";

  return data(
    await apiRequest<ApiResponse<FactoryReceptionList>>(
      `/factory-receptions${suffix}`,
    ),
  );
}

export async function getFactoryReceptionSummary(
  seasonId?: number,
): Promise<FactoryReceptionSummary> {
  const suffix = seasonId
    ? `?coffee_season_id=${seasonId}`
    : "";

  return data(
    await apiRequest<ApiResponse<FactoryReceptionSummary>>(
      `/factory-receptions/summary${suffix}`,
    ),
  );
}

export async function getFactoryReception(
  id: number,
): Promise<FactoryReception> {
  return data(
    await apiRequest<ApiResponse<FactoryReception>>(
      `/factory-receptions/${id}`,
    ),
  );
}
