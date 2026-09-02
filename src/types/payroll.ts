export type PayrollStatus =
  | "draft"
  | "processed"
  | "paid"
  | "cancelled";

export type PayrollPaymentMethod =
  | "cash"
  | "mobile_money"
  | "bank_transfer";

export type PayrollUser = {
  id: number;
  name: string;
  email?: string | null;
  role?: string | null;
};

export type PayrollEmployee = {
  id: number;
  name: string;
  email?: string | null;
  role?: string | null;
};

export type Payroll = {
  id: number;
  payroll_code: string;

  employee_id: number;
  employee_name: string;
  employee_role?: string | null;

  payroll_month: string;

  basic_salary: string;
  allowances: string;
  gross_salary: string;
  deductions: string;
  net_salary: string;

  currency: string;

  status: PayrollStatus;

  payment_method?: PayrollPaymentMethod | null;
  payment_reference?: string | null;
  payment_date?: string | null;

  notes?: string | null;

  processed_at?: string | null;
  paid_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;

  employee?: PayrollUser | null;
  creator?: PayrollUser | null;
  updater?: PayrollUser | null;
  processor?: PayrollUser | null;
  payer?: PayrollUser | null;
  canceller?: PayrollUser | null;
};

export type PayrollSummary = {
  payroll_month: string;

  total_records: number;
  draft_records: number;
  processed_records: number;
  paid_records: number;

  gross_payroll: string;
  total_deductions: string;
  net_payroll: string;
  total_paid: string;

  currency: string;
};

export type PayrollList = {
  items: Payroll[];

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
