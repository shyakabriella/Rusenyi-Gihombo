export type ProcessingYieldStatus =
  | "draft"
  | "confirmed"
  | "cancelled";

export type ProcessingYieldUser = {
  id: number;
  name: string;
  email?: string | null;
};

export type ProcessingYieldCoffeeLot = {
  id: number;
  lot_code: string;
  coffee_type?: string;
  initial_weight_kg?: string;
  current_weight_kg?: string;
  processing_stage?: string;
  status?: string;
  storage_location?: string | null;
  lot_date?: string | null;
};

export type ProcessingYieldInventory = {
  id: number;
  inventory_code: string;
  coffee_lot_id: number;
  coffee_season_id: number;
  coffee_type: string;
  current_quantity_kg: string;
  storage_location: string;
  status: string;
};

export type EligibleProcessingBatch = {
  id: number;
  batch_code: string;

  store_inventory_id: number;
  coffee_lot_id: number;
  coffee_season_id: number;

  process_name: string;
  input_quantity_kg: string;

  source_storage_location: string;
  status: string;

  completed_at?: string | null;

  inventory?: ProcessingYieldInventory | null;

  coffee_lot?: ProcessingYieldCoffeeLot | null;

  season?: {
    id: number;
    code: string;
    name: string;
  } | null;
};

export type ProcessingYield = {
  id: number;
  yield_code: string;

  processing_batch_id: number;
  store_inventory_id: number;
  source_coffee_lot_id: number;
  coffee_season_id: number;

  input_quantity_kg: string;
  output_quantity_kg: string;
  loss_quantity_kg: string;

  yield_percentage: string;
  loss_percentage: string;

  output_coffee_type: string;
  output_processing_stage: string;

  output_bag_count?: number | null;

  yield_date: string;

  output_coffee_lot_id?: number | null;

  status: ProcessingYieldStatus;

  notes?: string | null;

  confirmed_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;

  processing_batch?: {
    id: number;
    batch_code: string;
    process_name: string;
    input_quantity_kg: string;
    status: string;
  } | null;

  inventory?: ProcessingYieldInventory | null;

  source_coffee_lot?: ProcessingYieldCoffeeLot | null;

  output_coffee_lot?: ProcessingYieldCoffeeLot | null;

  season?: {
    id: number;
    code: string;
    name: string;
  } | null;

  creator?: ProcessingYieldUser | null;
  updater?: ProcessingYieldUser | null;
  confirmer?: ProcessingYieldUser | null;
  canceller?: ProcessingYieldUser | null;
};

export type ProcessingYieldSummary = {
  total_records: number;
  draft_records: number;
  confirmed_records: number;
  cancelled_records: number;

  total_input_kg: string;
  total_output_kg: string;
  total_loss_kg: string;

  average_yield_percentage: string;
  average_loss_percentage: string;
};

export type ProcessingYieldList = {
  items: ProcessingYield[];

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
