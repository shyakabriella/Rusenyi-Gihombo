import type {
  Pagination,
  User,
} from "@/types/user";

export type DriverStatus =
  | "active"
  | "inactive"
  | "suspended";

export type DriverVehicle = {
  id: number;
  vehicle_code?: string | null;
  registration_number?: string | null;
  vehicle_type?: string | null;
  capacity_kg?: number | null;
  status?: string | null;
};

export type Driver = {
  id: number;
  driver_code: string;
  user_id: number;

  license_number?: string | null;
  license_category?: string | null;
  license_expiry_date?: string | null;

  status: DriverStatus;
  notes?: string | null;

  user?: User | null;

  assigned_vehicle?: DriverVehicle | null;
  assignedVehicle?: DriverVehicle | null;

  created_at?: string | null;
  updated_at?: string | null;
};

export type DriverSummary = {
  total_drivers: number;
  active_drivers: number;
  inactive_drivers: number;
  suspended_drivers: number;
  assigned_drivers: number;
  unassigned_drivers: number;
};

export type DriverCollection = {
  items: Driver[];
  pagination: Pagination;
};

export type DriverFilters = {
  search?: string;
  status?: string;
  page?: number;
  per_page?: number;
};

export type CreateDriverPayload = {
  user_id: number;
  license_number?: string | null;
  license_category?: string | null;
  license_expiry_date?: string | null;
  notes?: string | null;
};

export type UpdateDriverPayload = {
  license_number?: string | null;
  license_category?: string | null;
  license_expiry_date?: string | null;
  notes?: string | null;
};
