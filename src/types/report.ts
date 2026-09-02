export type ReportPeriod = {
  date_from?: string | null;
  date_to?: string | null;
};

export type FinanceReport = {
  period: ReportPeriod;

  expenses: {
    recorded_count: number;
    recorded_amount: string;
    cancelled_count: number;
    cancelled_amount: string;
  };

  petty_cash: {
    funding_count: number;
    funding_amount: string;
    expense_count: number;
    expense_amount: string;
    current_balance: string;
  };

  total_operational_spending: string;
  currency: string;
};

export type PayrollReport = {
  period: ReportPeriod;

  total_records: number;
  draft_count: number;
  processed_count: number;
  paid_count: number;
  cancelled_count: number;

  gross_salary: string;
  deductions: string;
  net_salary: string;
  paid_amount: string;
  outstanding_amount: string;

  currency: string;
};

export type ApprovalReport = {
  period: ReportPeriod;

  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;

  pending_amount: string;
  approved_amount: string;
  applied_amount: string;

  currency: string;
};

export type OperationsReport = {
  period: ReportPeriod;

  coffee_purchases: number;
  direct_farmer_deliveries: number;
  agent_collections: number;
  field_weighings: number;
  collection_trips: number;
  factory_receptions: number;
  coffee_lots: number;
  store_inventories: number;
  stock_movements: number;
  processing_batches: number;
};

export type ReportOverview = {
  period: ReportPeriod;

  finance: FinanceReport;
  payroll: PayrollReport;
  approvals: ApprovalReport;
  operations: OperationsReport;

  generated_at: string;
};
