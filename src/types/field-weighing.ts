export type FieldWeighingStatus =
  | "draft"
  | "confirmed"
  | "cancelled";

export type FieldWeighing = {
  id: number;
  weighing_code: string;

  coffee_season_id: number;
  agent_collection_id: number;
  agent_id: number;
  collection_point_id?: number | null;
  balance_officer_id: number;

  expected_quantity_kg: string;
  field_weight_kg: string;
  difference_kg: string;
  difference_percentage: string;

  bag_count?: number | null;
  weighed_at: string;

  status: FieldWeighingStatus;
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
    email?: string | null;
    phone?: string | null;
  } | null;

  creator?: {
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

export type FieldWeighingList = {
  items: FieldWeighing[];

  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type FieldWeighingSummary = {
  total_records: number;
  draft_records: number;
  confirmed_records: number;
  cancelled_records: number;

  expected_quantity_kg: string;
  field_weight_kg: string;
  difference_kg: string;
  shortage_quantity_kg: string;
};
