export type DirectDeliveryStatus =
  | "draft"
  | "confirmed"
  | "cancelled";

export type FarmerPaymentStatus =
  | "unpaid"
  | "paid";

export type FarmerPaymentMethod =
  | "cash"
  | "mobile_money"
  | "bank";

export type DirectDeliveryCoffeeType =
  | "cherry"
  | "parchment"
  | "green_coffee";

export type DirectDeliveryFarmer = {
  id: number;
  farmer_code: string;
  full_name: string;
  phone?: string | null;
  preferred_payment_method?: FarmerPaymentMethod | null;
};

export type BalanceOfficer = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
};

export type DirectFarmerDelivery = {
  id: number;
  delivery_code: string;

  coffee_season_id: number;
  coffee_price_id: number;
  farmer_id: number;
  balance_officer_id: number;

  coffee_type: DirectDeliveryCoffeeType;

  quantity_kg: string;
  price_per_kg: string;
  total_amount: string;
  currency: string;

  delivery_date: string;

  status: DirectDeliveryStatus;
  payment_status: FarmerPaymentStatus;

  payment_method?: FarmerPaymentMethod | null;
  payment_reference?: string | null;

  payment_proof_path?: string | null;
  payment_proof_original_name?: string | null;
  payment_proof_mime_type?: string | null;
  payment_proof_size?: number | null;
  payment_proof_uploaded_at?: string | null;

  purpose?: string | null;

  confirmed_at?: string | null;
  paid_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;

  season?: {
    id: number;
    code: string;
    name: string;
    status: string;
  } | null;

  coffee_price?: {
    id: number;
    code: string;
    coffee_type: DirectDeliveryCoffeeType;
    price_per_kg: string;
    currency: string;
  } | null;

  farmer?: DirectDeliveryFarmer | null;

  balance_officer?: BalanceOfficer | null;

  creator?: {
    id: number;
    name: string;
  } | null;

  updater?: {
    id: number;
    name: string;
  } | null;

  confirmer?: {
    id: number;
    name: string;
  } | null;

  payer?: {
    id: number;
    name: string;
  } | null;

  canceller?: {
    id: number;
    name: string;
  } | null;

  proof_uploader?: {
    id: number;
    name: string;
  } | null;
};

export type DirectFarmerDeliveryPayload = {
  farmer_id: number;
  balance_officer_id: number;
  coffee_type: DirectDeliveryCoffeeType;
  quantity_kg: number;
  delivery_date: string;
  purpose?: string | null;
};

export type DirectFarmerDeliveryList = {
  items: DirectFarmerDelivery[];

  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type DirectFarmerDeliverySummary = {
  total_records: number;
  draft_records: number;
  confirmed_records: number;
  cancelled_records: number;
  confirmed_quantity_kg: string;
  confirmed_amount: string;
  paid_amount: string;
  currency: string;
};
