import {
  apiRequest,
} from "@/lib/api";

import type {
  CreateWorkerPayload,
  Worker,
  WorkerCollectionResponse,
  WorkerStatus,
} from "@/types/worker";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

function unwrap<T>(
  response:
    | ApiResponse<T>
    | T,
): T {
  if (
    response &&
    typeof response ===
      "object" &&
    "data" in response
  ) {
    return (
      response as ApiResponse<T>
    ).data;
  }

  return response as T;
}

export async function getWorkers(
  filters: {
    search?: string;
    status?: string;
    page?: number;
    per_page?: number;
  } = {},
): Promise<WorkerCollectionResponse> {
  const params =
    new URLSearchParams();

  if (filters.search?.trim()) {
    params.set(
      "search",
      filters.search.trim(),
    );
  }

  if (filters.status) {
    params.set(
      "status",
      filters.status,
    );
  }

  if (filters.page) {
    params.set(
      "page",
      String(filters.page),
    );
  }

  params.set(
    "per_page",
    String(
      filters.per_page ??
        100,
    ),
  );

  const response =
    await apiRequest<
      | ApiResponse<WorkerCollectionResponse>
      | WorkerCollectionResponse
    >(
      `/workers?${params.toString()}`,
    );

  return unwrap(response);
}

export async function createWorker(
  payload: CreateWorkerPayload,
): Promise<Worker> {
  const response =
    await apiRequest<
      | ApiResponse<Worker>
      | Worker
    >(
      "/workers",
      {
        method: "POST",
        body:
          JSON.stringify(
            payload,
          ),
      },
    );

  return unwrap(response);
}

export async function updateWorkerStatus(
  workerId: number,
  status: WorkerStatus,
): Promise<Worker> {
  const response =
    await apiRequest<
      | ApiResponse<Worker>
      | Worker
    >(
      `/workers/${workerId}/status`,
      {
        method: "PATCH",

        body:
          JSON.stringify({
            status,
          }),
      },
    );

  return unwrap(response);
}
