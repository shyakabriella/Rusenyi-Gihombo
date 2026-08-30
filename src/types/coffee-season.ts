export type CoffeeSeasonStatus =
  | "draft"
  | "active"
  | "closed";

export type CoffeeSeason = {
  id: number;
  name: string;
  code: string;

  start_date: string;
  end_date?: string | null;

  status: CoffeeSeasonStatus;
  is_active: boolean;

  description?: string | null;

  creator?: {
    id: number;
    name: string;
  };

  activator?: {
    id: number;
    name: string;
  } | null;

  closer?: {
    id: number;
    name: string;
  } | null;

  activated_at?: string | null;
  closed_at?: string | null;

  created_at?: string | null;
  updated_at?: string | null;
};

export type CoffeeSeasonPagination = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};

export type CoffeeSeasonList = {
  items: CoffeeSeason[];
  pagination: CoffeeSeasonPagination;
};

export type CoffeeSeasonPayload = {
  name: string;
  start_date: string;
  end_date?: string | null;
  description?: string | null;
};
