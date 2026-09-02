export type ApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export type ApprovalUser = {
  id: number;
  name: string;
  email?: string | null;
};

export type ApprovalPayroll = {
  id: number;
  payroll_code: string;
  employee_id: number;
  employee_name: string;
  employee_role?: string | null;
  payroll_month: string;
  gross_salary: string;
  net_salary: string;
  currency: string;
  status: string;
  payment_method?: string | null;
  payment_reference?: string | null;
  payment_date?: string | null;
};

export type ApprovalRequest = {
  id: number;
  approval_code: string;

  module: string;
  action: string;

  reference_type: string;
  reference_id: number;
  reference_code?: string | null;

  title: string;
  description?: string | null;

  amount?: string | null;
  currency: string;

  status: ApprovalStatus;

  request_note?: string | null;
  requested_at?: string | null;

  reviewed_at?: string | null;
  review_note?: string | null;

  applied_at?: string | null;

  cancelled_at?: string | null;
  cancellation_reason?: string | null;

  requester?: ApprovalUser | null;
  reviewer?: ApprovalUser | null;
  applier?: ApprovalUser | null;
  canceller?: ApprovalUser | null;

  payroll?: ApprovalPayroll | null;
};

export type ApprovalSummary = {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  cancelled_requests: number;

  pending_amount: string;
  approved_unapplied_amount: string;

  currency: string;
};

export type ApprovalList = {
  items: ApprovalRequest[];

  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type DashboardRole =
  | "admin"
  | "accountant"
  | string;
