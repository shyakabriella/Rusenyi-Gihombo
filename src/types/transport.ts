export type DriverStatus =
  | "active"
  | "inactive"
  | "suspended";

export type VehicleStatus =
  | "available"
  | "assigned"
  | "in_trip"
  | "maintenance"
  | "inactive";

export type TransportUser = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  role?: string;
  status?: string;
  is_active?: boolean;
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

  user?: TransportUser | null;

  assigned_vehicle?: {
    id: number;
    vehicle_code: string;
    registration_number: string;
    vehicle_type: string;
    capacity_kg?: string | null;
    status: VehicleStatus;
  } | null;

  creator?: TransportUser | null;
  updater?: TransportUser | null;
  status_changer?: TransportUser | null;

  status_changed_at?: string | null;
};

export type Vehicle = {
  id: number;
  vehicle_code: string;
  registration_number: string;
  vehicle_type: string;

  make?: string | null;
  model?: string | null;
  manufacture_year?: number | null;
  capacity_kg?: string | null;

  assigned_driver_id?: number | null;
  status: VehicleStatus;
  notes?: string | null;

  assigned_driver?: {
    id: number;
    driver_code: string;

    user?: TransportUser | null;
  } | null;

  creator?: TransportUser | null;
  updater?: TransportUser | null;
  status_changer?: TransportUser | null;

  status_changed_at?: string | null;
};

export type DriverSummary = {
  total_drivers: number;
  active_drivers: number;
  inactive_drivers: number;
  suspended_drivers: number;
  assigned_drivers: number;
  unassigned_drivers: number;
};

export type VehicleSummary = {
  total_vehicles: number;
  available_vehicles: number;
  assigned_vehicles: number;
  in_trip_vehicles: number;
  maintenance_vehicles: number;
  inactive_vehicles: number;
  total_capacity_kg: string;
};

export type Pagination = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type DriverList = {
  items: Driver[];
  pagination: Pagination;
};

export type VehicleList = {
  items: Vehicle[];
  pagination: Pagination;
};

export type DashboardRole =
  | "admin"
  | "accountant"
  | string;
