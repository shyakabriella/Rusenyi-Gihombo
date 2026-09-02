export type AgentStatus =
  | "active"
  | "inactive";

export type AgentUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role?: string;
  status?: string;
  is_active?: boolean;
};

export type AgentLocationItem = {
  id: number;
  name: string;
};

export type AgentHomeLocation = {
  province: AgentLocationItem | null;
  district: AgentLocationItem | null;
  sector: AgentLocationItem | null;
  cell: AgentLocationItem | null;
  village: AgentLocationItem | null;
};

export type AgentAuditUser = {
  id: number;
  name: string;
};

export type Agent = {
  id: number;

  agent_code: string;

  status: AgentStatus;

  is_active: boolean;

  notes?: string | null;

  user_id: number;

  home_village_id?: number | null;

  user: AgentUser;

  home_location?: AgentHomeLocation | null;

  creator?: AgentAuditUser | null;

  updater?: AgentAuditUser | null;

  deactivated_by?: AgentAuditUser | null;

  reactivated_by?: AgentAuditUser | null;

  deactivated_at?: string | null;

  reactivated_at?: string | null;

  created_at?: string | null;

  updated_at?: string | null;
};

export type AgentCreatePayload = {
  user_id: number;

  home_village_id?:
    number | null;

  notes?: string | null;
};

export type AgentUpdatePayload = {
  home_village_id?:
    number | null;

  notes?: string | null;
};

export type AgentPagination = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
};

export type AgentListResponse = {
  items: Agent[];
  pagination: AgentPagination;
};

export type AgentUserListResponse = {
  users: AgentUser[];

  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};
