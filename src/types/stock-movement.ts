export type StockMovementType =
  | "stock_in"
  | "stock_out"
  | "adjustment_in"
  | "adjustment_out"
  | "processing_issue"
  | "transfer"
  | "reversal";

export type StockMovementStatus =
  | "posted"
  | "reversed";

export type StockMovementUser = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
};

export type StockMovementInventory = {
  id: number;
  inventory_code: string;
  coffee_lot_id: number;
  coffee_season_id: number;
  coffee_type: string;
  current_quantity_kg: string;
  bag_count?: number | null;
  storage_location: string;
  status: string;

  coffee_lot?: {
    id: number;
    lot_code: string;
    coffee_type?: string;
    current_weight_kg?: string;
    processing_stage?: string;
  } | null;

  season?: {
    id: number;
    code: string;
    name: string;
  } | null;
};

export type StockMovement = {
  id: number;
  movement_code: string;

  store_inventory_id: number;
  coffee_lot_id: number;
  coffee_season_id: number;

  movement_type: StockMovementType;

  quantity_kg: string;
  quantity_before_kg: string;
  quantity_after_kg: string;

  from_location?: string | null;
  to_location?: string | null;

  reference_type?: string | null;
  reference_id?: number | null;

  reverses_stock_movement_id?: number | null;

  reason: string;
  notes?: string | null;

  status: StockMovementStatus;

  posted_at?: string | null;
  reversed_at?: string | null;
  reversal_reason?: string | null;

  inventory?: StockMovementInventory | null;

  coffee_lot?: {
    id: number;
    lot_code: string;
    coffee_type?: string;
    current_weight_kg?: string;
    processing_stage?: string;
  } | null;

  season?: {
    id: number;
    code: string;
    name: string;
  } | null;

  poster?: StockMovementUser | null;
  reverser?: StockMovementUser | null;

  reversed_movement?: StockMovement | null;
};

export type StockMovementSummary = {
  total_movements: number;
  stock_in_kg: string;
  stock_out_kg: string;
  processing_issued_kg: string;
  transfers: number;
  reversals: number;
  current_stock_kg: string;
};

export type StockMovementList = {
  items: StockMovement[];

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
