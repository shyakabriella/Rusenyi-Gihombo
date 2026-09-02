import { apiRequest } from "@/lib/api";

import type {
  AuditFilters,
  AuditLog,
  AuditLogList,
  AuditSummary,
} from "@/types/audit-log";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

function unwrap<T>(
  response: ApiResponse<T> | T,
): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    return (
      response as ApiResponse<T>
    ).data;
  }

  return response as T;
}

function queryString(
  filters: AuditFilters = {},
) {
  const query =
    new URLSearchParams();

  Object.entries(filters).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        query.set(
          key,
          String(value),
        );
      }
    },
  );

  const value =
    query.toString();

  return value
    ? `?${value}`
    : "";
}

export async function getAuditLogs(
  filters: AuditFilters = {},
): Promise<AuditLogList> {
  const response =
    await apiRequest<
      ApiResponse<AuditLogList>
    >(
      `/audit-logs${queryString(
        filters,
      )}`,
    );

  return unwrap(response);
}

export async function getAuditSummary(): Promise<AuditSummary> {
  const response =
    await apiRequest<
      ApiResponse<AuditSummary>
    >(
      "/audit-logs/summary",
    );

  return unwrap(response);
}

export async function getAuditLog(
  id: number,
): Promise<AuditLog> {
  const response =
    await apiRequest<
      ApiResponse<AuditLog>
    >(
      `/audit-logs/${id}`,
    );

  return unwrap(response);
}
