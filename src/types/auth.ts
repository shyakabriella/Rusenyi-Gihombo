export type Role = {
  id?: number;
  name: string;
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;

  role?: string | null;
  roles?: Role[];

  status?: string | null;
  is_active?: boolean;

  must_change_password?: boolean;

  created_at?: string;
  updated_at?: string;

  [key: string]: unknown;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResult = {
  token: string;
  user?: AuthUser;
  message?: string;
};
