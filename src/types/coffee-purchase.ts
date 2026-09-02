export type CoffeePurchaseStatus =
  | "draft"
  | "approved"
  | "cancelled";

export type CoffeeType =
  | "cherry"
  | "parchment"
  | "green_coffee";

export type CoffeePurchase = {
  id: number;
  purchase_code: string;

  coffee_season_id: number;
  coffee_price_id: number;
  agent_id: number;
  farmer_id: number;
  collection_point_id?: number | null;

  coffee_type: CoffeeType;

  quantity_kg: string;
  price_per_kg: string;
  total_amount: string;
  currency: string;

  purchase_date: string;
  status: CoffeePurchaseStatus;

  purpose?: string | null;

  season?: {
    id: number;
    code: string;
    name: string;
    status: string;
  } | null;

  coffee_price?: {
    id: number;
    code: string;
    coffee_type: CoffeeType;
    price_per_kg: string;
    currency: string;
  } | null;

  agent?: {
    id: number;
    agent_code: string;

    user?: {
      id: number;
      name: string;
      email?: string | null;
      phone?: string | null;
    } | null;
  } | null;

  farmer?: {
    id: number;
    farmer_code: string;
    full_name: string;
    phone?: string | null;
  } | null;

  collection_point?: {
    id: number;
    name: string;
    code: string;
  } | null;

  creator?: {
    id: number;
    name: string;
  } | null;

  approver?: {
    id: number;
    name: string;
  } | null;

  canceller?: {
    id: number;
    name: string;
  } | null;

  approved_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;

  created_at?: string | null;
};

export type CoffeePurchasePayload = {
  agent_id: number;
  farmer_id: number;
  collection_point_id?: number | null;
  coffee_type: CoffeeType;
  quantity_kg: number;
  purchase_date: string;
  purpose?: string | null;
};

export type CoffeePurchaseList = {
  items: CoffeePurchase[];

  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type CoffeePurchaseSummary = {
  total_records: number;
  draft_records: number;
  approved_records: number;
  cancelled_records: number;
  approved_quantity_kg: string;
  approved_amount: string;
  currency: string;
};

export type PurchaseFarmer = {
  id: number;
  farmer_code: string;
  full_name: string;
  phone?: string | null;
  collection_point_id?: number | null;
};
