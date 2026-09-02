export type WalletDirection =
  | "credit"
  | "debit";

export type AgentWalletAgent = {
  id: number;
  agent_code: string;
  status: string;

  user?: {
    id: number;
    name: string;
    phone?: string | null;
    email?: string | null;
  } | null;
};

export type AgentWalletSummary = {
  total_allocated: string;
  total_reversed: string;
  total_spent: string;
  purchase_reversals?: string;
  balance: string;
  currency: string;
};

export type AgentWalletItem = {
  agent: AgentWalletAgent;
  summary: AgentWalletSummary;
};

export type AgentWalletListResponse = {
  items: AgentWalletItem[];

  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number | null;
    to?: number | null;
  };
};

export type AgentWalletFinanceSummary = {
  total_allocated: string;
  total_reversed: string;
  total_spent: string;
  available_balance: string;
  agents_with_activity: number;
  currency: string;
};

export type AgentWalletTransaction = {
  id: number;
  transaction_code: string;
  type: string;
  direction: WalletDirection;
  amount: string;
  currency: string;

  source_type: string;
  source_id: number;

  description?: string | null;

  coffee_season?: {
    id: number;
    code: string;
    name: string;
  } | null;

  created_by?: {
    id: number;
    name: string;
  } | null;

  created_at?: string | null;
};

export type AgentWalletTransactionListResponse = {
  items: AgentWalletTransaction[];

  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export type AgentWalletDetail = {
  agent: AgentWalletAgent;
  summary: AgentWalletSummary;
};
