export type DashboardMetric = {
  value: number;
  unit: string;
  change_percent: number | null;
  scope?: string;
};

export type DashboardCards = {
  coffee_received_today: DashboardMetric;
  coffee_purchased_today: DashboardMetric;
  money_used_today: DashboardMetric;
  available_cash: DashboardMetric;
};

export type DashboardOperations = {
  active_agents: number;
  farmers_served_today: number;
  trips_today: number;
  store_stock_kg: number;
  pending_approvals: number;
};

export type DashboardFinance = {
  coffee_purchase_spending_today: number;
  direct_farmer_payments_today: number;
  expenses_today: number;
  agent_wallet_balance: number;
  petty_cash_balance: number;
  available_operational_cash: number;
};

export type DashboardWeeklyItem = {
  date: string;
  day: string;
  label: string;
  kg: number;
};

export type DashboardSourceItem = {
  name: string;
  value: number;
};

export type DashboardActivity = {
  id: number;
  code?: string | null;
  title: string;
  description: string;
  module?: string | null;
  action?: string | null;
  user_name?: string | null;
  created_at?: string | null;
};

export type DashboardTopAgent = {
  agent_id: number;
  name: string;
  quantity_kg: number;
  total_amount: number;
  collections: number;
};

export type DashboardOverview = {
  viewer_role: "admin" | "accountant";
  generated_at: string;
  currency: string;

  cards: DashboardCards;
  operations: DashboardOperations;
  finance: DashboardFinance;

  weekly_received: DashboardWeeklyItem[];
  source_breakdown: DashboardSourceItem[];
  recent_activities: DashboardActivity[];
  top_agents: DashboardTopAgent[];
  coffee_operations: CoffeeOperationsOverview;
};

export type CoffeeOperationMetric = {
  value: number;
  unit: string;
  note: string;
};

export type CoffeeOperationsOverview = {
  coffee_purchases: CoffeeOperationMetric;
  direct_farmer_deliveries: CoffeeOperationMetric;
  agent_collections: CoffeeOperationMetric;
  field_weighings: CoffeeOperationMetric;
  collection_trips: CoffeeOperationMetric;
  factory_receptions: CoffeeOperationMetric;
  weight_reconciliations: CoffeeOperationMetric;
  coffee_lots: CoffeeOperationMetric;
  store_inventories: CoffeeOperationMetric;
  stock_movements: CoffeeOperationMetric;
  processing_batches: CoffeeOperationMetric;
  processing_yield: CoffeeOperationMetric;

  flow: {
    purchased_kg: number;
    collected: number;
    transported_kg: number;
    factory_received_kg: number;
    stored_kg: number;
  };
};
