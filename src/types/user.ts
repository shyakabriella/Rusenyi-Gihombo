export type UserRole =
  | "admin"
  | "accountant"
  | "balance"
  | "agent"
  | "driver"
  | "store";

export type UserStatus =
  | "active"
  | "inactive"
  | "suspended";

export type User = {
  id: number;
  name: string;
  email: string;

  phone?: string | null;

  role?: UserRole | null;
  status?: UserStatus | null;

  is_active?: boolean;
  must_change_password?: boolean;

  email_verified_at?: string | null;
  last_login_at?: string | null;

  created_at?: string | null;
  updated_at?: string | null;
};

export type CreateUserPayload = {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
};

export type UpdateUserPayload = {
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
};

export type UserFilters = {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  per_page?: number;
};

export type Pagination = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};

export type UserCollectionResponse = {
  users: User[];
  pagination: Pagination;
};

export type CreateUserResponse = {
  user: User;
  credentials_email_sent: boolean;
};
