import type {
  CoffeeSeason,
} from "@/types/coffee-season";

export type CoffeePriceStatus =
  | "draft"
  | "active"
  | "inactive";

export type CoffeeType =
  | "cherry"
  | "parchment"
  | "green_coffee";

export type CoffeePriceUser = {
  id: number;
  name: string;
};

export type CoffeePrice = {
  id: number;

  coffee_season_id: number;

  code: string;

  coffee_type: CoffeeType;

  coffee_type_label: string;

  price_per_kg: number;

  currency: string;

  effective_from: string;

  effective_to?: string | null;

  status: CoffeePriceStatus;

  is_active: boolean;

  notes?: string | null;

  season?: CoffeeSeason | null;

  creator?: CoffeePriceUser | null;

  activator?: CoffeePriceUser | null;

  deactivator?: CoffeePriceUser | null;

  activated_at?: string | null;

  deactivated_at?: string | null;

  created_at?: string | null;

  updated_at?: string | null;
};

export type CoffeePricePayload = {
  coffee_season_id: number;

  coffee_type: CoffeeType;

  price_per_kg: number;

  effective_from: string;

  effective_to?: string | null;

  notes?: string | null;
};

export type CoffeePricePagination = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
};

export type CoffeePriceListResponse = {
  items: CoffeePrice[];
  pagination: CoffeePricePagination;
};

export type ActiveCoffeePriceResponse = {
  season: CoffeeSeason | null;
  prices: CoffeePrice[];
};
