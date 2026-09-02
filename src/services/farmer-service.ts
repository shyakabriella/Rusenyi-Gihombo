import {
  apiRequest,
} from "@/lib/api";

import type {
  Farmer,
  FarmerListResponse,
  FarmerPayload,
  FarmerStatus,
} from "@/types/farmer";

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

export type FarmerListParams = {
  search?: string;

  status?: FarmerStatus;

  province_id?: number;

  district_id?: number;

  sector_id?: number;

  cell_id?: number;

  village_id?: number;

  collection_point_id?: number;

  page?: number;

  per_page?: number;
};

export async function getFarmers(
  params: FarmerListParams = {},
): Promise<FarmerListResponse> {
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

  if (params.collection_point_id) {
    query.set(
      "collection_point_id",
      String(
        params.collection_point_id,
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
      Envelope<FarmerListResponse>
    >(
      `/admin/farmers?${query.toString()}`,
    );

  return unwrap(response);
}

export async function getFarmer(
  id: number,
): Promise<Farmer> {
  const response =
    await apiRequest<
      Envelope<Farmer>
    >(
      `/admin/farmers/${id}`,
    );

  return unwrap(response);
}

export async function createFarmer(
  payload: FarmerPayload,
): Promise<Farmer> {
  const response =
    await apiRequest<
      Envelope<Farmer>
    >(
      "/admin/farmers",
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

export async function updateFarmer(
  id: number,
  payload: FarmerPayload,
): Promise<Farmer> {
  const response =
    await apiRequest<
      Envelope<Farmer>
    >(
      `/admin/farmers/${id}`,
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

export async function deactivateFarmer(
  id: number,
): Promise<Farmer> {
  const response =
    await apiRequest<
      Envelope<Farmer>
    >(
      `/admin/farmers/${id}/deactivate`,
      {
        method: "PATCH",
      },
    );

  return unwrap(response);
}

export async function reactivateFarmer(
  id: number,
): Promise<Farmer> {
  const response =
    await apiRequest<
      Envelope<Farmer>
    >(
      `/admin/farmers/${id}/reactivate`,
      {
        method: "PATCH",
      },
    );

  return unwrap(response);
}
