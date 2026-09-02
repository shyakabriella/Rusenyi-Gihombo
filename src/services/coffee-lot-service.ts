import { apiRequest } from "@/lib/api";
import type {
  CoffeeLot,
  CoffeeLotList,
  CoffeeLotSource,
  CoffeeLotSourceType,
  CoffeeLotStatus,
  CoffeeLotSummary,
  DashboardRole,
} from "@/types/coffee-lot";

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



export async function getCoffeeLotDashboardRole(): Promise<DashboardRole> {
  const response = await apiRequest<
    ApiResponse<{ role: DashboardRole }>
  >("/me");

  return data(response).role;
}

export async function getCoffeeLots(
  params: {
    search?: string;
    status?: CoffeeLotStatus;
    source_type?: CoffeeLotSourceType;
    coffee_season_id?: number;
    page?: number;
    per_page?: number;
  } = {},
): Promise<CoffeeLotList> {
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
    await apiRequest<ApiResponse<CoffeeLotList>>(
      `/coffee-lots${suffix}`,
    ),
  );
}



export async function getCoffeeLot(
  id: number,
): Promise<CoffeeLot> {
  const response = await apiRequest<
    ApiResponse<CoffeeLot>
  >(`/coffee-lots/${id}`);

  return data(response);
}

export async function getCoffeeLotSummary(
  seasonId?: number,
): Promise<CoffeeLotSummary> {
  const suffix = seasonId
    ? `?coffee_season_id=${seasonId}`
    : "";

  return data(
    await apiRequest<ApiResponse<CoffeeLotSummary>>(
      `/coffee-lots/summary${suffix}`,
    ),
  );
}

export async function getCoffeeLotSources(): Promise<
  CoffeeLotSource[]
> {
  const response = data(
    await apiRequest<
      ApiResponse<{ items: CoffeeLotSource[] }>
    >("/coffee-lots/eligible-sources"),
  );

  return response.items;
}

export async function createCoffeeLot(payload: {
  source_type: CoffeeLotSourceType;
  source_id: number;
  bag_count?: number;
  storage_location?: string;
  lot_date: string;
  notes?: string;
}): Promise<CoffeeLot> {
  return data(
    await apiRequest<ApiResponse<CoffeeLot>>(
      "/coffee-lots",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),
  );
}

export async function updateCoffeeLot(
  id: number,
  payload: {
    bag_count?: number;
    storage_location?: string;
    notes?: string;
  },
): Promise<CoffeeLot> {
  return data(
    await apiRequest<ApiResponse<CoffeeLot>>(
      `/coffee-lots/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    ),
  );
}

export async function closeCoffeeLot(
  id: number,
): Promise<CoffeeLot> {
  return data(
    await apiRequest<ApiResponse<CoffeeLot>>(
      `/coffee-lots/${id}/close`,
      {
        method: "PATCH",
      },
    ),
  );
}
