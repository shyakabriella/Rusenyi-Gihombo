export type AgentCollectionStatus =
  | "open"
  | "completed"
  | "cancelled";

export type AgentCollectionAgent = {
  id: number;
  agent_code: string;

  user?: {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
  } | null;
};

export type AgentCollectionPurchase = {
  id: number;
  purchase_code: string;
  farmer_id: number;
  coffee_type: string;
  quantity_kg: string;
  total_amount: string;
  purchase_date: string;

  farmer?: {
    id: number;
    farmer_code: string;
    full_name: string;
    phone?: string | null;
  } | null;

  collection_point?: {
    id: number;
    name: string;
  } | null;
};

export type AgentCollection = {
  id: number;
  collection_code: string;

  coffee_season_id: number;
  agent_id: number;
  collection_point_id?: number | null;

  collection_date: string;
  status: AgentCollectionStatus;
  notes?: string | null;

  purchases_count: number;
  farmers_count: number;

  total_quantity_kg: string;
  total_amount: string;
  currency: string;

  season?: {
    id: number;
    code: string;
    name: string;
    status: string;
  } | null;

  agent?: AgentCollectionAgent | null;

  collection_point?: {
    id: number;
    name: string;
  } | null;

  purchases?: AgentCollectionPurchase[];

  creator?: {
    id: number;
    name: string;
  } | null;

  completer?: {
    id: number;
    name: string;
  } | null;

  canceller?: {
    id: number;
    name: string;
  } | null;

  completed_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
};

export type AgentCollectionList = {
  items: AgentCollection[];

  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type AgentCollectionSummary = {
  total_collections: number;
  open_collections: number;
  completed_collections: number;
  cancelled_collections: number;
  completed_quantity_kg: string;
  completed_amount: string;
  farmers_served: number;
  currency: string;
};

export type EligibleCollectionPurchase =
  AgentCollectionPurchase;
