export type PettyCashTransactionType =
  | "fund_in"
  | "expense"
  | "reversal";

export type PettyCashStatus =
  | "posted"
  | "reversed";

export type PettyCashUser = {
  id: number;
  name: string;
  email?: string | null;
};

export type PettyCashExpense = {
  id: number;
  expense_code: string;
  expense_date: string;
  category: string;
  payee_name: string;
  amount: string;
  currency: string;
  status: string;
};

export type PettyCashTransaction = {
  id: number;
  transaction_code: string;
  transaction_date: string;

  transaction_type: PettyCashTransactionType;

  amount: string;
  balance_before: string;
  balance_after: string;

  currency: string;

  category?: string | null;
  counterparty_name: string;
  purpose: string;

  reference_number?: string | null;
  receipt_number?: string | null;

  expense_id?: number | null;
  reverses_transaction_id?: number | null;

  status: PettyCashStatus;

  notes?: string | null;

  posted_at?: string | null;
  reversed_at?: string | null;
  reversal_reason?: string | null;

  expense?: PettyCashExpense | null;
  poster?: PettyCashUser | null;
  reverser?: PettyCashUser | null;

  reversed_transaction?: PettyCashTransaction | null;
};

export type PettyCashSummary = {
  current_balance: string;
  total_funded: string;
  total_spent: string;
  today_spent: string;
  this_month_spent: string;

  funding_transactions: number;
  expense_transactions: number;
  reversal_transactions: number;

  currency: string;
};

export type PettyCashList = {
  items: PettyCashTransaction[];

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
