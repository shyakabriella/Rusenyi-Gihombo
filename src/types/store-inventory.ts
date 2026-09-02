export type StoreInventoryStatus =
  | "active"
  | "cancelled";

export type StoreInventoryUser = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
};

export type StoreInventoryCoffeeLot = {
  id: number;
  lot_code: string;
  coffee_season_id: number;
  source_type: string;
  source_id: number;
  coffee_type: string;
  initial_weight_kg: string;
  current_weight_kg: string;
  bag_count?: number | null;
  processing_stage: string;
  status: string;
  storage_location?: string | null;
  lot_date?: string | null;
};

export type StoreInventory = {
  id: number;
  inventory_code: string;

  coffee_lot_id: number;
  coffee_season_id: number;

  source_type: string;
  source_id: number;

  coffee_type: string;

  initial_quantity_kg: string;
  current_quantity_kg: string;

  bag_count?: number | null;
  storage_location: string;

  received_at: string;
  status: StoreInventoryStatus;

  notes?: string | null;

  cancelled_at?: string | null;
  cancellation_reason?: string | null;

  coffee_lot?: StoreInventoryCoffeeLot | null;

  season?: {
    id: number;
    code: string;
    name: string;
    status?: string;
  } | null;

  receiver?: StoreInventoryUser | null;
  creator?: StoreInventoryUser | null;
  updater?: StoreInventoryUser | null;
  canceller?: StoreInventoryUser | null;
};

export type EligibleCoffeeLot = {
  id: number;
  lot_code: string;

  coffee_season_id: number;

  source_type: string;
  source_id: number;

  coffee_type: string;

  initial_weight_kg: string;
  current_weight_kg: string;

  bag_count?: number | null;

  processing_stage: string;
  status: string;

  lot_date?: string | null;

  season?: {
    id: number;
    code: string;
    name: string;
  } | null;
};

export type StoreInventorySummary = {
  active_inventory_records: number;
  total_stock_kg: string;
  total_initial_stock_kg: string;
  total_bags: number;
  storage_locations: number;
  cancelled_records: number;
};

export type StoreInventoryList = {
  items: StoreInventory[];

  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type DashboardRole =
  | "admin"
  | "accountant"
  | string;
