export type CashAllocationStatus =
  | "draft"
  | "approved"
  | "cancelled";

export type CashAllocationPaymentMethod =
  | "cash"
  | "mobile_money"
  | "bank_transfer";

export type CashAllocation = {
  id: number;

  allocation_code: string;

  coffee_season_id: number;
  agent_id: number;

  amount: string;
  currency: string;

  payment_method:
    | CashAllocationPaymentMethod
    | null;

  reference?: string | null;

  payment_reference?: string | null;

  payment_proof?: {
    exists: boolean;

    url?: string | null;

    original_name?: string | null;

    mime_type?: string | null;

    size?: number | null;

    uploaded_at?: string | null;
  };

  allocation_date: string;

  purpose?: string | null;
  notes?: string | null;

  status: CashAllocationStatus;

  is_draft: boolean;
  is_approved: boolean;

  coffee_season?: {
    id: number;
    code: string;
    name: string;
    status: string;
  } | null;

  agent?: {
    id: number;

    agent_code: string;

    status: string;

    user?: {
      id: number;
      name: string;
      phone: string;
      email: string;
    } | null;
  } | null;

  creator?: {
    id: number;
    name: string;
  } | null;

  approver?: {
    id: number;
    name: string;
  } | null;

  canceller?: {
    id: number;
    name: string;
  } | null;

  approved_at?: string | null;

  cancelled_at?: string | null;

  cancellation_reason?: string | null;

  created_at?: string | null;
  updated_at?: string | null;
};

export type CashAllocationPayload = {
  coffee_season_id: number;

  agent_id: number;

  amount: number;

  payment_method:
    CashAllocationPaymentMethod;

  allocation_date: string;

  reference?: string | null;

  purpose?: string | null;

  notes?: string | null;
};

export type CashAllocationListResponse = {
  items: CashAllocation[];

  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type CashAllocationSummary = {
  currency: string;

  total_records: number;

  draft_amount: string;

  approved_amount: string;

  cancelled_amount: string;
};

export type CashAllocationAgent = {
  id: number;

  agent_code: string;

  status: string;

  user?: {
    id: number;
    name: string;
    phone: string;
    email: string;
  } | null;
};

export type ActiveCoffeeSeason = {
  id: number;
  code: string;
  name: string;
  status: string;
};
