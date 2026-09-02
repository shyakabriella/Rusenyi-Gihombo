import { apiRequest } from "@/lib/api";

import type {
  CollectionTrip,
  CollectionTripList,
  CollectionTripStatus,
  CollectionTripSummary,
  DashboardRole,
  DriverLookup,
  EligibleFieldWeighing,
} from "@/types/collection-trip";

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

export async function getCollectionTripDashboardRole(): Promise<DashboardRole> {
  const response = await apiRequest<
    ApiResponse<{ role: DashboardRole }>
  >("/me");

  return unwrap(response).role;
}

export async function getCollectionTrips(
  params: {
    search?: string;
    status?: CollectionTripStatus;
    agent_id?: number;
    driver_user_id?: number;
    coffee_season_id?: number;
    collection_point_id?: number;
    page?: number;
    per_page?: number;
  } = {},
): Promise<CollectionTripList> {
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
    ApiResponse<CollectionTripList>
  >(`/collection-trips${suffix}`);

  return unwrap(response);
}

export async function getCollectionTripSummary(): Promise<CollectionTripSummary> {
  const response = await apiRequest<
    ApiResponse<CollectionTripSummary>
  >("/collection-trips/summary");

  return unwrap(response);
}

export async function getCollectionTrip(
  id: number,
): Promise<CollectionTrip> {
  const response = await apiRequest<
    ApiResponse<CollectionTrip>
  >(`/collection-trips/${id}`);

  return unwrap(response);
}

export async function getEligibleFieldWeighings(): Promise<
  EligibleFieldWeighing[]
> {
  const response = await apiRequest<
    ApiResponse<{
      items: EligibleFieldWeighing[];
    }>
  >(
    "/collection-trips/eligible-weighings",
  );

  return unwrap(response).items;
}

export async function getCollectionTripDrivers(): Promise<
  DriverLookup[]
> {
  const response = await apiRequest<
    ApiResponse<{
      items: DriverLookup[];
    }>
  >(
    "/collection-trips/driver-lookup",
  );

  return unwrap(response).items;
}

export async function createCollectionTrip(
  payload: {
    field_weighing_id: number;
    driver_user_id?: number;
    vehicle_registration?: string;
    notes?: string;
  },
): Promise<CollectionTrip> {
  const response = await apiRequest<
    ApiResponse<CollectionTrip>
  >("/collection-trips", {
    method: "POST",

    body: JSON.stringify(
      payload,
    ),
  });

  return unwrap(response);
}

export async function updateCollectionTrip(
  id: number,
  payload: {
    driver_user_id?: number;
    vehicle_registration?: string;
    notes?: string;
  },
): Promise<CollectionTrip> {
  const response = await apiRequest<
    ApiResponse<CollectionTrip>
  >(
    `/collection-trips/${id}`,
    {
      method: "PUT",

      body: JSON.stringify(
        payload,
      ),
    },
  );

  return unwrap(response);
}

export async function completeCollectionTrip(
  id: number,
): Promise<CollectionTrip> {
  const response = await apiRequest<
    ApiResponse<CollectionTrip>
  >(
    `/collection-trips/${id}/complete`,
    {
      method: "PATCH",
    },
  );

  return unwrap(response);
}

export async function cancelCollectionTrip(
  id: number,
  cancellationReason: string,
): Promise<CollectionTrip> {
  const response = await apiRequest<
    ApiResponse<CollectionTrip>
  >(
    `/collection-trips/${id}/cancel`,
    {
      method: "PATCH",

      body: JSON.stringify({
        cancellation_reason:
          cancellationReason,
      }),
    },
  );

  return unwrap(response);
}
