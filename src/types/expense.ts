export type ExpenseStatus =
  | "draft"
  | "recorded"
  | "cancelled";

export type ExpensePaymentMethod =
  | "cash"
  | "mobile_money"
  | "bank_transfer"
  | "other";

export type ExpenseUser = {
  id: number;
  name: string;
  email?: string | null;
};

export type Expense = {
  id: number;
  expense_code: string;

  expense_date: string;

  category: string;
  payee_name: string;
  description: string;

  amount: string;
  currency: string;

  payment_method: ExpensePaymentMethod;

  payment_reference?: string | null;
  receipt_number?: string | null;

  source_type?: string | null;
  source_id?: number | null;

  status: ExpenseStatus;

  notes?: string | null;

  recorded_at?: string | null;

  cancelled_at?: string | null;
  cancellation_reason?: string | null;

  creator?: ExpenseUser | null;
  updater?: ExpenseUser | null;
  recorder?: ExpenseUser | null;
  canceller?: ExpenseUser | null;
};

export type ExpenseSummary = {
  total_expenses: number;
  draft_expenses: number;
  recorded_expenses: number;
  cancelled_expenses: number;

  total_recorded_amount: string;
  today_amount: string;
  this_month_amount: string;

  currency: string;
};

export type ExpenseList = {
  items: Expense[];

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
