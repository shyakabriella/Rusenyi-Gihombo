import { apiRequest } from "@/lib/api";

import type {
  NotificationList,
  NotificationSummary,
  SystemNotification,
} from "@/types/notification";

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

export async function getNotifications(
  params: {
    search?: string;
    type?: string;
    module?: string;
    read_status?: "read" | "unread";
    page?: number;
    per_page?: number;
  } = {},
): Promise<NotificationList> {
  const query =
    new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== ""
      ) {
        query.set(
          key,
          String(value),
        );
      }
    },
  );

  const suffix =
    query.toString()
      ? `?${query.toString()}`
      : "";

  const response =
    await apiRequest<
      ApiResponse<NotificationList>
    >(
      `/notifications${suffix}`,
    );

  return unwrap(response);
}

export async function getNotificationSummary(): Promise<NotificationSummary> {
  const response =
    await apiRequest<
      ApiResponse<NotificationSummary>
    >(
      "/notifications/summary",
    );

  return unwrap(response);
}

export async function getNotification(
  id: number,
): Promise<SystemNotification> {
  const response =
    await apiRequest<
      ApiResponse<SystemNotification>
    >(
      `/notifications/${id}`,
    );

  return unwrap(response);
}

export async function markNotificationRead(
  id: number,
): Promise<SystemNotification> {
  const response =
    await apiRequest<
      ApiResponse<SystemNotification>
    >(
      `/notifications/${id}/read`,
      {
        method: "PATCH",
      },
    );

  return unwrap(response);
}

export async function markNotificationUnread(
  id: number,
): Promise<SystemNotification> {
  const response =
    await apiRequest<
      ApiResponse<SystemNotification>
    >(
      `/notifications/${id}/unread`,
      {
        method: "PATCH",
      },
    );

  return unwrap(response);
}

export async function markAllNotificationsRead(): Promise<number> {
  const response =
    await apiRequest<
      ApiResponse<{
        updated: number;
      }>
    >(
      "/notifications/read-all",
      {
        method: "PATCH",
      },
    );

  return unwrap(response).updated;
}
