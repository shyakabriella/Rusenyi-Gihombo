import {
  apiRequest,
} from "@/lib/api";

import type {
  ActiveCoffeePriceResponse,
  CoffeePrice,
  CoffeePriceListResponse,
  CoffeePricePayload,
  CoffeePriceStatus,
  CoffeeType,
} from "@/types/coffee-price";

type Envelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

function unwrap<T>(
  response: T | Envelope<T>,
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

export type CoffeePriceListParams = {
  search?: string;

  coffee_season_id?: number;

  coffee_type?: CoffeeType;

  status?: CoffeePriceStatus;

  page?: number;

  per_page?: number;
};

export async function getCoffeePrices(
  params: CoffeePriceListParams = {},
): Promise<CoffeePriceListResponse> {
  const searchParams =
    new URLSearchParams();

  if (params.search) {
    searchParams.set(
      "search",
      params.search,
    );
  }

  if (params.coffee_season_id) {
    searchParams.set(
      "coffee_season_id",
      String(
        params.coffee_season_id,
      ),
    );
  }

  if (params.coffee_type) {
    searchParams.set(
      "coffee_type",
      params.coffee_type,
    );
  }

  if (params.status) {
    searchParams.set(
      "status",
      params.status,
    );
  }

  if (params.page) {
    searchParams.set(
      "page",
      String(params.page),
    );
  }

  if (params.per_page) {
    searchParams.set(
      "per_page",
      String(params.per_page),
    );
  }

  const query =
    searchParams.toString();

  const response =
    await apiRequest<
      Envelope<CoffeePriceListResponse>
    >(
      `/admin/coffee-prices${
        query
          ? `?${query}`
          : ""
      }`,
    );

  return unwrap(response);
}

export async function getCoffeePrice(
  id: number,
): Promise<CoffeePrice> {
  const response =
    await apiRequest<
      Envelope<CoffeePrice>
    >(
      `/admin/coffee-prices/${id}`,
    );

  return unwrap(response);
}

export async function createCoffeePrice(
  payload: CoffeePricePayload,
): Promise<CoffeePrice> {
  const response =
    await apiRequest<
      Envelope<CoffeePrice>
    >(
      "/admin/coffee-prices",
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

export async function updateCoffeePrice(
  id: number,
  payload: CoffeePricePayload,
): Promise<CoffeePrice> {
  const response =
    await apiRequest<
      Envelope<CoffeePrice>
    >(
      `/admin/coffee-prices/${id}`,
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

export async function activateCoffeePrice(
  id: number,
): Promise<CoffeePrice> {
  const response =
    await apiRequest<
      Envelope<CoffeePrice>
    >(
      `/admin/coffee-prices/${id}/activate`,
      {
        method: "PATCH",
      },
    );

  return unwrap(response);
}

export async function deactivateCoffeePrice(
  id: number,
): Promise<CoffeePrice> {
  const response =
    await apiRequest<
      Envelope<CoffeePrice>
    >(
      `/admin/coffee-prices/${id}/deactivate`,
      {
        method: "PATCH",
      },
    );

  return unwrap(response);
}

export async function getActiveCoffeePrices(
  coffeeType?: CoffeeType,
): Promise<ActiveCoffeePriceResponse> {
  const query =
    coffeeType
      ? `?coffee_type=${encodeURIComponent(
          coffeeType,
        )}`
      : "";

  const response =
    await apiRequest<
      Envelope<ActiveCoffeePriceResponse>
    >(
      `/coffee-prices/active${query}`,
    );

  return unwrap(response);
}
