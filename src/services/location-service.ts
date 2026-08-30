import { apiRequest } from "@/lib/api";

import type {
  AgentCollectionPointAssignment,
  Cell,
  CollectionPoint,
  District,
  LocationList,
  Province,
  Sector,
  Village,
} from "@/types/location";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

function unwrap<T>(
  response:
    | ApiEnvelope<T>
    | T,
): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    "success" in response
  ) {
    return (
      response as ApiEnvelope<T>
    ).data;
  }

  return response as T;
}

function queryString(
  values: Record<
    string,
    string | number | undefined
  >,
) {
  const params =
    new URLSearchParams();

  Object.entries(values)
    .forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== ""
      ) {
        params.set(
          key,
          String(value),
        );
      }
    });

  const query =
    params.toString();

  return query
    ? `?${query}`
    : "";
}

export async function getProvinces(
  filters: {
    search?: string;
    status?: string;
    page?: number;
    per_page?: number;
  } = {},
) {
  const response =
    await apiRequest<
      ApiEnvelope<
        LocationList<Province>
      >
    >(
      `/admin/locations/provinces${queryString(filters)}`,
    );

  return unwrap(response);
}

export async function getDistricts(
  filters: {
    province_id?: number;
    search?: string;
    status?: string;
    page?: number;
    per_page?: number;
  } = {},
) {
  const response =
    await apiRequest<
      ApiEnvelope<
        LocationList<District>
      >
    >(
      `/admin/locations/districts${queryString(filters)}`,
    );

  return unwrap(response);
}

export async function getSectors(
  filters: {
    province_id?: number;
    district_id?: number;
    search?: string;
    status?: string;
    page?: number;
    per_page?: number;
  } = {},
) {
  const response =
    await apiRequest<
      ApiEnvelope<
        LocationList<Sector>
      >
    >(
      `/admin/locations/sectors${queryString(filters)}`,
    );

  return unwrap(response);
}

export async function getCells(
  filters: {
    province_id?: number;
    district_id?: number;
    sector_id?: number;
    search?: string;
    status?: string;
    page?: number;
    per_page?: number;
  } = {},
) {
  const response =
    await apiRequest<
      ApiEnvelope<
        LocationList<Cell>
      >
    >(
      `/admin/locations/cells${queryString(filters)}`,
    );

  return unwrap(response);
}

export async function getVillages(
  filters: {
    province_id?: number;
    district_id?: number;
    sector_id?: number;
    cell_id?: number;
    search?: string;
    status?: string;
    page?: number;
    per_page?: number;
  } = {},
) {
  const response =
    await apiRequest<
      ApiEnvelope<
        LocationList<Village>
      >
    >(
      `/admin/locations/villages${queryString(filters)}`,
    );

  return unwrap(response);
}

export async function getCollectionPoints(
  filters: {
    province_id?: number;
    district_id?: number;
    sector_id?: number;
    cell_id?: number;
    village_id?: number;
    search?: string;
    status?: string;
    page?: number;
    per_page?: number;
  } = {},
) {
  const response =
    await apiRequest<
      ApiEnvelope<
        LocationList<CollectionPoint>
      >
    >(
      `/admin/locations/collection-points${queryString(filters)}`,
    );

  return unwrap(response);
}

export async function lookupProvinces() {
  const response =
    await apiRequest<
      ApiEnvelope<Province[]>
    >("/locations/provinces");

  return unwrap(response);
}

export async function lookupDistricts(
  provinceId: number,
) {
  const response =
    await apiRequest<
      ApiEnvelope<District[]>
    >(
      `/locations/districts?province_id=${provinceId}`,
    );

  return unwrap(response);
}

export async function lookupSectors(
  districtId: number,
) {
  const response =
    await apiRequest<
      ApiEnvelope<Sector[]>
    >(
      `/locations/sectors?district_id=${districtId}`,
    );

  return unwrap(response);
}

export async function lookupCells(
  sectorId: number,
) {
  const response =
    await apiRequest<
      ApiEnvelope<Cell[]>
    >(
      `/locations/cells?sector_id=${sectorId}`,
    );

  return unwrap(response);
}

export async function lookupVillages(
  cellId: number,
) {
  const response =
    await apiRequest<
      ApiEnvelope<Village[]>
    >(
      `/locations/villages?cell_id=${cellId}`,
    );

  return unwrap(response);
}

export async function lookupCollectionPoints(
  villageId?: number,
) {
  const query =
    villageId
      ? `?village_id=${villageId}`
      : "";

  const response =
    await apiRequest<
      ApiEnvelope<CollectionPoint[]>
    >(
      `/locations/collection-points${query}`,
    );

  return unwrap(response);
}

export async function createProvince(
  payload: {
    name: string;
  },
) {
  const response =
    await apiRequest<
      ApiEnvelope<Province>
    >(
      "/admin/locations/provinces",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

  return unwrap(response);
}

export async function createDistrict(
  payload: {
    province_id: number;
    name: string;
  },
) {
  const response =
    await apiRequest<
      ApiEnvelope<District>
    >(
      "/admin/locations/districts",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

  return unwrap(response);
}

export async function createSector(
  payload: {
    district_id: number;
    name: string;
  },
) {
  const response =
    await apiRequest<
      ApiEnvelope<Sector>
    >(
      "/admin/locations/sectors",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

  return unwrap(response);
}

export async function createCell(
  payload: {
    sector_id: number;
    name: string;
  },
) {
  const response =
    await apiRequest<
      ApiEnvelope<Cell>
    >(
      "/admin/locations/cells",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

  return unwrap(response);
}

export async function createVillage(
  payload: {
    cell_id: number;
    name: string;
  },
) {
  const response =
    await apiRequest<
      ApiEnvelope<Village>
    >(
      "/admin/locations/villages",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

  return unwrap(response);
}

export async function createCollectionPoint(
  payload: {
    village_id: number;
    name: string;
    code: string;
    latitude?: number;
    longitude?: number;
    description?: string;
  },
) {
  const response =
    await apiRequest<
      ApiEnvelope<CollectionPoint>
    >(
      "/admin/locations/collection-points",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

  return unwrap(response);
}

export async function updateLocationStatus(
  type:
    | "provinces"
    | "districts"
    | "sectors"
    | "cells"
    | "villages"
    | "collection-points",
  id: number,
  isActive: boolean,
) {
  return apiRequest(
    `/admin/locations/${type}/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        is_active: isActive,
      }),
    },
  );
}

export async function getAgentCollectionPoints(
  agentId: number,
) {
  const response =
    await apiRequest<
      ApiEnvelope<
        AgentCollectionPointAssignment[]
      >
    >(
      `/admin/locations/agents/${agentId}/collection-points`,
    );

  return unwrap(response);
}

export async function assignAgentCollectionPoints(
  agentId: number,
  collectionPointIds: number[],
) {
  const response =
    await apiRequest<
      ApiEnvelope<
        AgentCollectionPointAssignment[]
      >
    >(
      `/admin/locations/agents/${agentId}/collection-points`,
      {
        method: "POST",
        body: JSON.stringify({
          collection_point_ids:
            collectionPointIds,
        }),
      },
    );

  return unwrap(response);
}

export async function updateAgentCollectionPointStatus(
  agentId: number,
  collectionPointId: number,
  isActive: boolean,
) {
  const response =
    await apiRequest<
      ApiEnvelope<
        AgentCollectionPointAssignment[]
      >
    >(
      `/admin/locations/agents/${agentId}/collection-points/${collectionPointId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({
        is_active: isActive,
      }),
      },
    );

  return unwrap(response);
}
