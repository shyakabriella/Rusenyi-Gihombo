import { apiRequest } from "@/lib/api";

import type {
  CoffeeSeason,
  CoffeeSeasonList,
  CoffeeSeasonPayload,
} from "@/types/coffee-season";

type Envelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

function unwrap<T>(
  response: Envelope<T> | T,
): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    "success" in response
  ) {
    return (
      response as Envelope<T>
    ).data;
  }

  return response as T;
}

function makeQuery(
  filters: {
    search?: string;
    status?: string;
    year?: number;
    page?: number;
    per_page?: number;
  },
) {
  const params =
    new URLSearchParams();

  Object.entries(filters)
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

export async function getCoffeeSeasons(
  filters: {
    search?: string;
    status?: string;
    year?: number;
    page?: number;
    per_page?: number;
  } = {},
) {
  const response =
    await apiRequest<
      Envelope<CoffeeSeasonList>
    >(
      `/admin/coffee-seasons${makeQuery(
        filters,
      )}`,
    );

  return unwrap(response);
}

export async function getCoffeeSeason(
  id: number,
) {
  const response =
    await apiRequest<
      Envelope<CoffeeSeason>
    >(
      `/admin/coffee-seasons/${id}`,
    );

  return unwrap(response);
}

export async function getActiveCoffeeSeason() {
  const response =
    await apiRequest<
      Envelope<CoffeeSeason | null>
    >(
      "/coffee-seasons/active",
    );

  return unwrap(response);
}

export async function createCoffeeSeason(
  payload: CoffeeSeasonPayload,
) {
  const response =
    await apiRequest<
      Envelope<CoffeeSeason>
    >(
      "/admin/coffee-seasons",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

  return unwrap(response);
}

export async function updateCoffeeSeason(
  id: number,
  payload: CoffeeSeasonPayload,
) {
  const response =
    await apiRequest<
      Envelope<CoffeeSeason>
    >(
      `/admin/coffee-seasons/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    );

  return unwrap(response);
}

export async function activateCoffeeSeason(
  id: number,
) {
  const response =
    await apiRequest<
      Envelope<CoffeeSeason>
    >(
      `/admin/coffee-seasons/${id}/activate`,
      {
        method: "PATCH",
      },
    );

  return unwrap(response);
}

export async function closeCoffeeSeason(
  id: number,
) {
  const response =
    await apiRequest<
      Envelope<CoffeeSeason>
    >(
      `/admin/coffee-seasons/${id}/close`,
      {
        method: "PATCH",
      },
    );

  return unwrap(response);
}

export async function reopenCoffeeSeason(
  id: number,
) {
  const response =
    await apiRequest<
      Envelope<CoffeeSeason>
    >(
      `/admin/coffee-seasons/${id}/reopen`,
      {
        method: "PATCH",
      },
    );

  return unwrap(response);
}
