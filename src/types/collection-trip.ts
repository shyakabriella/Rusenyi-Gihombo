export type CollectionTripStatus =
  | "planned"
  | "in_transit"
  | "arrived"
  | "completed"
  | "cancelled";

export type CollectionTripUser = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
};

export type CollectionTripAgent = {
  id: number;
  agent_code?: string;
  user?: CollectionTripUser | null;
};

export type CollectionTrip = {
  id: number;
  trip_code: string;

  coffee_season_id: number;
  agent_collection_id: number;
  field_weighing_id: number;
  agent_id: number;
  collection_point_id?: number | null;
  driver_user_id?: number | null;

  vehicle_registration?: string | null;
  field_weight_kg: string;

  status: CollectionTripStatus;

  departure_at?: string | null;
  arrived_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;

  notes?: string | null;
  cancellation_reason?: string | null;

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
    weighed_at?: string | null;
    status: string;
  } | null;

  agent?: CollectionTripAgent | null;

  collection_point?: {
    id: number;
    name: string;
  } | null;

  driver?: CollectionTripUser | null;

  creator?: CollectionTripUser | null;
  starter?: CollectionTripUser | null;
  arriver?: CollectionTripUser | null;
  completer?: CollectionTripUser | null;
  canceller?: CollectionTripUser | null;
};

export type CollectionTripList = {
  items: CollectionTrip[];

  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type CollectionTripSummary = {
  total_trips: number;
  planned_trips: number;
  in_transit_trips: number;
  arrived_trips: number;
  completed_trips: number;
  cancelled_trips: number;
  completed_weight_kg: string;
};

export type EligibleFieldWeighing = {
  id: number;
  weighing_code: string;

  coffee_season_id: number;
  agent_collection_id: number;
  agent_id: number;
  collection_point_id?: number | null;

  field_weight_kg: string;
  weighed_at?: string | null;

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

  agent?: CollectionTripAgent | null;

  collection_point?: {
    id: number;
    name: string;
  } | null;
};

export type DriverLookup = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
};

export type DashboardRole =
  | "admin"
  | "accountant"
  | string;
