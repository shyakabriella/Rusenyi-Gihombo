import {
  apiRequest,
} from "@/lib/api";

import type {
  CreateDriverPayload,
  Driver,
  DriverCollection,
  DriverFilters,
  DriverStatus,
  DriverSummary,
  UpdateDriverPayload,
} from "@/types/driver";

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

function queryString(
  filters: DriverFilters = {},
) {
  const query =
    new URLSearchParams();

  Object.entries(filters).forEach(
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

  const value =
    query.toString();

  return value
    ? `?${value}`
    : "";
}

export async function getDrivers(
  filters: DriverFilters = {},
): Promise<DriverCollection> {
  const response =
    await apiRequest<
      ApiResponse<DriverCollection>
    >(
      `/transport/drivers${queryString(
        filters,
      )}`,
    );

  return unwrap(response);
}

export async function getDriverSummary(): Promise<DriverSummary> {
  const response =
    await apiRequest<
      ApiResponse<DriverSummary>
    >(
      "/transport/drivers/summary",
    );

  return unwrap(response);
}

export async function createDriver(
  payload: CreateDriverPayload,
): Promise<Driver> {
  const response =
    await apiRequest<
      ApiResponse<Driver>
    >(
      "/transport/drivers",
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

export async function updateDriver(
  id: number,
  payload: UpdateDriverPayload,
): Promise<Driver> {
  const response =
    await apiRequest<
      ApiResponse<Driver>
    >(
      `/transport/drivers/${id}`,
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

export async function updateDriverStatus(
  id: number,
  status: DriverStatus,
): Promise<Driver> {
  const response =
    await apiRequest<
      ApiResponse<Driver>
    >(
      `/transport/drivers/${id}/status`,
      {
        method: "PATCH",
        body:
          JSON.stringify({
            status,
          }),
      },
    );

  return unwrap(response);
}
