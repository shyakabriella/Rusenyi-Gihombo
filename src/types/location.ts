export type LocationStatus =
  | "active"
  | "inactive";

export type Pagination = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};

export type LocationList<T> = {
  items: T[];
  pagination: Pagination;
};

export type Province = {
  id: number;
  name: string;
  is_active: boolean;
  districts_count?: number;
};

export type District = {
  id: number;
  province_id: number;
  name: string;
  is_active: boolean;
  province?: {
    id: number;
    name: string;
  };
  sectors_count?: number;
};

export type Sector = {
  id: number;
  district_id: number;
  name: string;
  is_active: boolean;
  district?: {
    id: number;
    name: string;
    province_id: number;
  };
  cells_count?: number;
};

export type Cell = {
  id: number;
  sector_id: number;
  name: string;
  is_active: boolean;
  sector?: {
    id: number;
    name: string;
    district_id: number;
  };
  villages_count?: number;
};

export type Village = {
  id: number;
  cell_id: number;
  name: string;
  is_active: boolean;
  cell?: {
    id: number;
    name: string;
    sector_id: number;
  };
  collection_points_count?: number;
};

export type CollectionPoint = {
  id: number;
  village_id: number;
  name: string;
  code: string;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  is_active: boolean;

  location?: {
    province?: {
      id: number;
      name: string;
    } | null;

    district?: {
      id: number;
      name: string;
    } | null;

    sector?: {
      id: number;
      name: string;
    } | null;

    cell?: {
      id: number;
      name: string;
    } | null;

    village: {
      id: number;
      name: string;
    };
  } | null;

  agents_count?: number;
};

export type AgentCollectionPointAssignment = {
  collection_point: CollectionPoint;

  assignment: {
    is_active: boolean;
    assigned_at?: string | null;
    unassigned_at?: string | null;
  };
};
