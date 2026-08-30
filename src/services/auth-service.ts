import { apiRequest } from "@/lib/api";
import {
  removeToken,
  saveToken,
} from "@/lib/auth-storage";

import type {
  AuthUser,
  LoginCredentials,
  LoginResult,
} from "@/types/auth";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type LoginData = {
  token: string;
  token_type?: string;
  must_change_password?: boolean;
  user?: AuthUser;
};

type ChangePasswordData = {
  token: string;
  token_type: string;
  must_change_password: boolean;
};

type MeResponse = {
  success: boolean;
  message: string;
  data: AuthUser;
};

type MessageResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;
};

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResult> {
  const response = await apiRequest<ApiResponse<LoginData>>(
    "/login",
    {
      method: "POST",
      auth: false,
      body: JSON.stringify(credentials),
    },
  );

  const token = response.data?.token;

  if (!token) {
    throw new Error(
      "The server did not return an authentication token.",
    );
  }

  saveToken(token);

  let user = response.data.user;

  if (!user) {
    user = await getCurrentUser();
  }

  return {
    token,
    user,
    message: response.message,
  };
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiRequest<MeResponse>("/me", {
    method: "GET",
  });

  return response.data;
}

export async function changePassword(data: {
  current_password: string;
  password: string;
  password_confirmation: string;
}): Promise<ApiResponse<ChangePasswordData>> {
  const response =
    await apiRequest<ApiResponse<ChangePasswordData>>(
      "/change-password",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );

  /*
   * Laravel revokes the old authentication token after
   * the password is changed and returns a new token.
   *
   * The new token must replace the old browser token.
   */
  if (!response.data?.token) {
    throw new Error(
      "Password changed but the server did not return a new authentication token.",
    );
  }

  saveToken(response.data.token);

  return response;
}

export async function logout(): Promise<void> {
  try {
    await apiRequest<MessageResponse>("/logout", {
      method: "POST",
    });
  } finally {
    removeToken();
  }
}

export async function forgotPassword(
  email: string,
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>(
    "/forgot-password",
    {
      method: "POST",
      auth: false,
      body: JSON.stringify({
        email,
      }),
    },
  );
}
