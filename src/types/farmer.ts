export type FarmerStatus =
  | "active"
  | "inactive";

export type FarmerGender =
  | "male"
  | "female"
  | "other";

export type FarmerPaymentMethod =
  | "cash"
  | "mobile_money"
  | "bank";

export type FarmerLocationItem = {
  id: number;
  name: string;
};

export type FarmerLocation = {
  province: FarmerLocationItem;
  district: FarmerLocationItem;
  sector: FarmerLocationItem;
  cell: FarmerLocationItem;
  village: FarmerLocationItem;
};

export type FarmerCollectionPoint = {
  id: number;
  name: string;
  code: string;
};

export type FarmerUser = {
  id: number;
  name: string;
};

export type Farmer = {
  id: number;

  farmer_code: string;

  full_name: string;

  phone: string;

  national_id?: string | null;

  gender?: FarmerGender | null;

  preferred_payment_method:
    FarmerPaymentMethod;

  address_note?: string | null;

  notes?: string | null;

  status: FarmerStatus;

  is_active: boolean;

  village_id: number;

  collection_point_id?: number | null;

  location?: FarmerLocation | null;

  collection_point?:
    FarmerCollectionPoint | null;

  creator?: FarmerUser | null;

  updater?: FarmerUser | null;

  deactivated_by?: FarmerUser | null;

  reactivated_by?: FarmerUser | null;

  deactivated_at?: string | null;

  reactivated_at?: string | null;

  created_at?: string | null;

  updated_at?: string | null;
};

export type FarmerPayload = {
  full_name: string;

  phone: string;

  national_id?: string | null;

  gender?: FarmerGender | null;

  village_id: number;

  collection_point_id?:
    number | null;

  preferred_payment_method:
    FarmerPaymentMethod;

  address_note?: string | null;

  notes?: string | null;
};

export type FarmerPagination = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
};

export type FarmerListResponse = {
  items: Farmer[];
  pagination: FarmerPagination;
};

export type LocationOption = {
  id: number;
  name: string;
  code?: string;
};
