import { apiRequest } from "@/lib/api";

import type {
  DashboardOverview,
} from "@/types/dashboard";

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

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const response =
    await apiRequest<
      ApiResponse<DashboardOverview>
    >(
      "/dashboard/overview",
    );

  return unwrap(response);
}
