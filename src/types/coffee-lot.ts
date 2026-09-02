export type CoffeeLotSourceType =
  | "factory_reception"
  | "direct_farmer_delivery";

export type CoffeeLotStatus =
  | "active"
  | "closed";

export type CoffeeLot = {
  id: number;
  lot_code: string;
  coffee_season_id: number;
  source_type: CoffeeLotSourceType;
  source_id: number;
  coffee_type: string;
  initial_weight_kg: string;
  current_weight_kg: string;
  bag_count?: number | null;
  processing_stage: string;
  status: CoffeeLotStatus;
  storage_location?: string | null;
  lot_date: string;
  notes?: string | null;
  season?: {
    id: number;
    code: string;
    name: string;
    status: string;
  } | null;
  creator?: {
    id: number;
    name: string;
  } | null;
  closer?: {
    id: number;
    name: string;
  } | null;
  closed_at?: string | null;
};

export type CoffeeLotSource = {
  source_type: CoffeeLotSourceType;
  source_id: number;
  reference: string;
  weight_kg: string;
  date?: string | null;
  label: string;
};

export type CoffeeLotList = {
  items: CoffeeLot[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type CoffeeLotSummary = {
  total_lots: number;
  active_lots: number;
  closed_lots: number;
  initial_weight_kg: string;
  current_weight_kg: string;
};


export type DashboardRole =
  | "admin"
  | "accountant"
  | "store"
  | string;
