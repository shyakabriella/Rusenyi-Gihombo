export type WeightReconciliationStatus =
  | "draft"
  | "reconciled"
  | "cancelled";

export type WeightReconciliationOutcome =
  | "within_tolerance"
  | "shortage"
  | "excess";

export type WeightUser = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
};

export type WeightAgent = {
  id: number;
  agent_code?: string | null;
  user?: WeightUser | null;
};

export type WeightReconciliation = {
  id: number;
  reconciliation_code: string;

  factory_reception_id: number;
  coffee_season_id: number;
  agent_collection_id: number;
  field_weighing_id: number;
  agent_id: number;
  collection_point_id?: number | null;

  field_weight_kg: string;
  factory_weight_kg: string;

  difference_kg: string;
  difference_percentage: string;

  tolerance_percentage: string;

  outcome?: WeightReconciliationOutcome | null;
  status: WeightReconciliationStatus;

  notes?: string | null;

  reconciled_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;

  factory_reception?: {
    id: number;
    reception_code: string;
    status: string;
    received_at?: string | null;
  } | null;

  season?: {
    id: number;
    code: string;
    name: string;
    status?: string;
  } | null;

  agent_collection?: {
    id: number;
    collection_code: string;
    collection_date?: string;
    status?: string;
  } | null;

  field_weighing?: {
    id: number;
    weighing_code: string;
    field_weight_kg?: string;
    status?: string;
  } | null;

  agent?: WeightAgent | null;

  collection_point?: {
    id: number;
    name: string;
  } | null;

  creator?: WeightUser | null;
  updater?: WeightUser | null;
  reconciler?: WeightUser | null;
  canceller?: WeightUser | null;
};

export type WeightReconciliationSummary = {
  total_reconciliations: number;
  draft_reconciliations: number;
  reconciled_reconciliations: number;

  within_tolerance: number;
  shortages: number;
  excesses: number;

  net_difference_kg: string;
  absolute_variance_kg: string;
};

export type EligibleFactoryReception = {
  id: number;
  reception_code: string;

  coffee_season_id: number;
  agent_collection_id: number;
  field_weighing_id: number;
  agent_id: number;
  collection_point_id?: number | null;

  field_weight_kg: string;
  factory_weight_kg: string;
  difference_kg: string;
  difference_percentage: string;

  received_at?: string | null;

  season?: {
    id: number;
    code: string;
    name: string;
  } | null;

  agent_collection?: {
    id: number;
    collection_code: string;
  } | null;

  field_weighing?: {
    id: number;
    weighing_code: string;
  } | null;

  agent?: WeightAgent | null;

  collection_point?: {
    id: number;
    name: string;
  } | null;
};

export type WeightReconciliationList = {
  items: WeightReconciliation[];

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
