import { getToken, removeToken } from "@/lib/auth-storage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

type ApiOptions = RequestInit & {
  auth?: boolean;
};

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const {
    auth = true,
    headers,
    ...requestOptions
  } = options;

  const requestHeaders = new Headers(headers);

  requestHeaders.set("Accept", "application/json");

  if (
    requestOptions.body &&
    !(requestOptions.body instanceof FormData)
  ) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getToken();

    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      headers: requestHeaders,
    });
  } catch {
    throw new ApiError(
      "Unable to connect to the server. Please check your connection.",
      0,
    );
  }

  const contentType = response.headers.get("content-type");

  let data: unknown = null;

  if (contentType?.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
    }

    const apiData = data as {
      message?: string;
    } | null;

    throw new ApiError(
      apiData?.message || "Something went wrong.",
      response.status,
      data,
    );
  }

  return data as T;
}
