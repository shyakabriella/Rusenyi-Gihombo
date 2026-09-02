import { apiRequest } from "@/lib/api";

import type {
  DashboardRole,
  Driver,
  DriverList,
  DriverStatus,
  DriverSummary,
  TransportUser,
  Vehicle,
  VehicleList,
  VehicleStatus,
  VehicleSummary,
} from "@/types/transport";

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

export async function getTransportRole(): Promise<DashboardRole> {
  const response = await apiRequest<
    ApiResponse<{
      role: DashboardRole;
    }>
  >("/me");

  return unwrap(response).role;
}

export async function getDriverUsers(): Promise<
  TransportUser[]
> {
  const response = await apiRequest<
    ApiResponse<{
      items?: TransportUser[];
      data?: TransportUser[];
    }>
  >(
    "/admin/users?role=driver&status=active&per_page=100",
  );

  const result = unwrap(response);

  if (Array.isArray(result)) {
    return result;
  }

  if (
    result &&
    Array.isArray(result.items)
  ) {
    return result.items;
  }

  if (
    result &&
    Array.isArray(result.data)
  ) {
    return result.data;
  }

  return [];
}

export async function getDrivers(
  params: {
    search?: string;
    status?: DriverStatus;
    page?: number;
    per_page?: number;
  } = {},
): Promise<DriverList> {
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
    ApiResponse<DriverList>
  >(`/transport/drivers${suffix}`);

  return unwrap(response);
}

export async function getDriverSummary(): Promise<DriverSummary> {
  const response = await apiRequest<
    ApiResponse<DriverSummary>
  >("/transport/drivers/summary");

  return unwrap(response);
}

export async function createDriver(
  payload: {
    user_id: number;
    license_number?: string;
    license_category?: string;
    license_expiry_date?: string;
    notes?: string;
  },
): Promise<Driver> {
  const response = await apiRequest<
    ApiResponse<Driver>
  >("/transport/drivers", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return unwrap(response);
}

export async function updateDriver(
  id: number,
  payload: {
    license_number?: string | null;
    license_category?: string | null;
    license_expiry_date?: string | null;
    notes?: string | null;
  },
): Promise<Driver> {
  const response = await apiRequest<
    ApiResponse<Driver>
  >(`/transport/drivers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return unwrap(response);
}

export async function updateDriverStatus(
  id: number,
  status: DriverStatus,
): Promise<Driver> {
  const response = await apiRequest<
    ApiResponse<Driver>
  >(
    `/transport/drivers/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    },
  );

  return unwrap(response);
}

export async function getVehicles(
  params: {
    search?: string;
    status?: VehicleStatus;
    page?: number;
    per_page?: number;
  } = {},
): Promise<VehicleList> {
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
    ApiResponse<VehicleList>
  >(`/transport/vehicles${suffix}`);

  return unwrap(response);
}

export async function getVehicleSummary(): Promise<VehicleSummary> {
  const response = await apiRequest<
    ApiResponse<VehicleSummary>
  >("/transport/vehicles/summary");

  return unwrap(response);
}

export async function createVehicle(
  payload: {
    registration_number: string;
    vehicle_type: string;
    make?: string;
    model?: string;
    manufacture_year?: number;
    capacity_kg?: number;
    notes?: string;
  },
): Promise<Vehicle> {
  const response = await apiRequest<
    ApiResponse<Vehicle>
  >("/transport/vehicles", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return unwrap(response);
}

export async function updateVehicle(
  id: number,
  payload: {
    registration_number?: string;
    vehicle_type?: string;
    make?: string | null;
    model?: string | null;
    manufacture_year?: number | null;
    capacity_kg?: number | null;
    notes?: string | null;
  },
): Promise<Vehicle> {
  const response = await apiRequest<
    ApiResponse<Vehicle>
  >(`/transport/vehicles/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  return unwrap(response);
}

export async function assignVehicleDriver(
  vehicleId: number,
  driverId: number,
): Promise<Vehicle> {
  const response = await apiRequest<
    ApiResponse<Vehicle>
  >(
    `/transport/vehicles/${vehicleId}/assign-driver`,
    {
      method: "PATCH",
      body: JSON.stringify({
        driver_id: driverId,
      }),
    },
  );

  return unwrap(response);
}

export async function unassignVehicleDriver(
  vehicleId: number,
): Promise<Vehicle> {
  const response = await apiRequest<
    ApiResponse<Vehicle>
  >(
    `/transport/vehicles/${vehicleId}/unassign-driver`,
    {
      method: "PATCH",
    },
  );

  return unwrap(response);
}

export async function updateVehicleStatus(
  vehicleId: number,
  status:
    | "available"
    | "maintenance"
    | "inactive",
): Promise<Vehicle> {
  const response = await apiRequest<
    ApiResponse<Vehicle>
  >(
    `/transport/vehicles/${vehicleId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    },
  );

  return unwrap(response);
}
