import { apiRequest } from "@/lib/api";

import type {
  FieldWeighing,
  FieldWeighingList,
  FieldWeighingStatus,
  FieldWeighingSummary,
} from "@/types/field-weighing";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

function getData<T>(
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

export async function getFieldWeighings(
  params: {
    search?: string;
    status?: FieldWeighingStatus;
    agent_id?: number;
    coffee_season_id?: number;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  } = {},
): Promise<FieldWeighingList> {
  const query = new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== ""
      ) {
        query.set(key, String(value));
      }
    },
  );

  const suffix = query.toString()
    ? `?${query.toString()}`
    : "";

  const response = await apiRequest<
    ApiResponse<FieldWeighingList>
  >(`/field-weighings${suffix}`);

  return getData(response);
}

export async function getFieldWeighingSummary(
  seasonId?: number,
): Promise<FieldWeighingSummary> {
  const suffix = seasonId
    ? `?coffee_season_id=${seasonId}`
    : "";

  const response = await apiRequest<
    ApiResponse<FieldWeighingSummary>
  >(`/field-weighings/summary${suffix}`);

  return getData(response);
}

export async function getFieldWeighing(
  id: number,
): Promise<FieldWeighing> {
  const response = await apiRequest<
    ApiResponse<FieldWeighing>
  >(`/field-weighings/${id}`);

  return getData(response);
}
