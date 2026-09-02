import {
  apiRequest,
} from "@/lib/api";

import type {
  LocationOption,
} from "@/types/farmer";

type Envelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

function extractItems(
  response: unknown,
): LocationOption[] {
  if (
    Array.isArray(response)
  ) {
    return response as LocationOption[];
  }

  if (
    !response ||
    typeof response !==
      "object"
  ) {
    return [];
  }

  const object =
    response as Record<
      string,
      unknown
    >;

  if (
    Array.isArray(
      object.items,
    )
  ) {
    return object.items as LocationOption[];
  }

  if (
    object.data &&
    typeof object.data ===
      "object"
  ) {
    const data =
      object.data as Record<
        string,
        unknown
      >;

    if (
      Array.isArray(
        data.items,
      )
    ) {
      return data.items as LocationOption[];
    }

    if (
      Array.isArray(
        object.data,
      )
    ) {
      return object.data as LocationOption[];
    }
  }

  if (
    Array.isArray(
      object.data,
    )
  ) {
    return object.data as LocationOption[];
  }

  return [];
}

async function lookup(
  path: string,
): Promise<LocationOption[]> {
  const response =
    await apiRequest<
      | Envelope<LocationOption[]>
      | Envelope<{
          items:
            LocationOption[];
        }>
      | LocationOption[]
    >(path);

  return extractItems(
    response,
  );
}

export function getProvinceOptions() {
  return lookup(
    "/locations/provinces",
  );
}

export function getDistrictOptions(
  provinceId: number,
) {
  return lookup(
    `/locations/districts?province_id=${provinceId}`,
  );
}

export function getSectorOptions(
  districtId: number,
) {
  return lookup(
    `/locations/sectors?district_id=${districtId}`,
  );
}

export function getCellOptions(
  sectorId: number,
) {
  return lookup(
    `/locations/cells?sector_id=${sectorId}`,
  );
}

export function getVillageOptions(
  cellId: number,
) {
  return lookup(
    `/locations/villages?cell_id=${cellId}`,
  );
}

export function getCollectionPointOptions(
  villageId: number,
) {
  return lookup(
    `/locations/collection-points?village_id=${villageId}`,
  );
}
