export type ProcessingBatchStatus =
  | "draft"
  | "in_progress"
  | "completed"
  | "cancelled";

export type ProcessingUser = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
};

export type ProcessingCoffeeLot = {
  id: number;
  lot_code: string;
  coffee_type?: string;
  current_weight_kg?: string;
  processing_stage?: string;
  storage_location?: string | null;
  status?: string;
};

export type ProcessingInventory = {
  id: number;
  inventory_code: string;

  coffee_lot_id: number;
  coffee_season_id: number;

  coffee_type: string;
  current_quantity_kg: string;

  bag_count?: number | null;
  storage_location: string;
  status: string;

  coffee_lot?: ProcessingCoffeeLot | null;

  season?: {
    id: number;
    code: string;
    name: string;
  } | null;
};

export type ProcessingIssueMovement = {
  id: number;
  movement_code: string;
  movement_type: string;

  quantity_kg: string;
  quantity_before_kg: string;
  quantity_after_kg: string;

  status: string;
  posted_at?: string | null;
};

export type ProcessingBatch = {
  id: number;
  batch_code: string;

  store_inventory_id: number;
  coffee_lot_id: number;
  coffee_season_id: number;

  process_name: string;
  input_quantity_kg: string;

  source_storage_location: string;

  planned_start_at?: string | null;

  status: ProcessingBatchStatus;

  processing_issue_movement_id?: number | null;

  notes?: string | null;

  started_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;

  cancellation_reason?: string | null;

  inventory?: ProcessingInventory | null;
  coffee_lot?: ProcessingCoffeeLot | null;

  season?: {
    id: number;
    code: string;
    name: string;
  } | null;

  processing_issue_movement?: ProcessingIssueMovement | null;

  creator?: ProcessingUser | null;
  updater?: ProcessingUser | null;
  starter?: ProcessingUser | null;
  completer?: ProcessingUser | null;
  canceller?: ProcessingUser | null;
};

export type ProcessingBatchSummary = {
  total_batches: number;
  draft_batches: number;
  in_progress_batches: number;
  completed_batches: number;
  cancelled_batches: number;
  issued_to_processing_kg: string;
  currently_processing_kg: string;
};

export type ProcessingBatchList = {
  items: ProcessingBatch[];

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
