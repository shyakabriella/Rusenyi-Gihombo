export type AuditAction =
  | "created"
  | "updated"
  | "deleted"
  | string;

export type AuditUser = {
  id: number;
  name: string;
  email?: string | null;
  role?: string | null;
};

export type AuditValues =
  Record<string, unknown>;

export type AuditLog = {
  id: number;
  audit_code: string;
  action: AuditAction;
  module: string;
  description: string;

  auditable_type: string;
  auditable_id: number;
  auditable_code?: string | null;

  old_values?: AuditValues | null;
  new_values?: AuditValues | null;

  request_method?: string | null;
  request_path?: string | null;
  route_name?: string | null;

  ip_address?: string | null;
  user_agent?: string | null;

  user_name?: string | null;
  user_role?: string | null;

  user?: AuditUser | null;

  created_at: string;
};

export type AuditPagination = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type AuditLogList = {
  items: AuditLog[];
  pagination: AuditPagination;
};

export type AuditSummary = {
  total_logs: number;
  created_actions: number;
  updated_actions: number;
  deleted_actions: number;
  today: number;
  active_users: number;
};

export type AuditFilters = {
  search?: string;
  module?: string;
  action?: string;
  user_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
};
