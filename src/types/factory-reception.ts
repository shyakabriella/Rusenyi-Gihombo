export type FactoryReceptionStatus =
  | "draft"
  | "confirmed"
  | "cancelled";

export type FactoryReception = {
  id: number;
  reception_code: string;
  coffee_season_id: number;
  agent_collection_id: number;
  field_weighing_id: number;
  agent_id: number;
  collection_point_id?: number | null;
  balance_officer_id: number;
  field_weight_kg: string;
  factory_weight_kg: string;
  difference_kg: string;
  difference_percentage: string;
  bag_count?: number | null;
  received_at: string;
  status: FactoryReceptionStatus;
  notes?: string | null;

  season?: {
    id: number;
    code: string;
    name: string;
    status: string;
  } | null;

  agent_collection?: {
    id: number;
    collection_code: string;
    collection_date: string;
    status: string;
  } | null;

  field_weighing?: {
    id: number;
    weighing_code: string;
    field_weight_kg: string;
    weighed_at: string;
    status: string;
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

  collection_point?: {
    id: number;
    name: string;
  } | null;

  balance_officer?: {
    id: number;
    name: string;
  } | null;

  confirmer?: {
    id: number;
    name: string;
  } | null;

  canceller?: {
    id: number;
    name: string;
  } | null;

  confirmed_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
};

export type FactoryReceptionList = {
  items: FactoryReception[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type FactoryReceptionSummary = {
  total_records: number;
  draft_records: number;
  confirmed_records: number;
  cancelled_records: number;
  field_weight_kg: string;
  factory_weight_kg: string;
  difference_kg: string;
  shortage_quantity_kg: string;
};
