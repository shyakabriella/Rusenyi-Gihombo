import {
  apiRequest,
} from "@/lib/api";

import type {
  PettyCashRequest,
  PettyCashRequestList,
  PettyCashRequestStatus,
  PettyCashSummary,
} from "@/types/petty-cash";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type LaravelPaginator<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
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

export async function getPettyCashSummary() {
  const response =
    await apiRequest<
      ApiResponse<PettyCashSummary>
    >(
      "/petty-cash/requests/summary",
      {
        method: "GET",
      },
    );

  return unwrap(
    response,
  );
}

export async function getPettyCashRequests(
  params: {
    status?:
      PettyCashRequestStatus;

    page?: number;
    per_page?: number;
  } = {},
): Promise<PettyCashRequestList> {
  const query =
    new URLSearchParams();

  if (params.status) {
    query.set(
      "status",
      params.status,
    );
  }

  query.set(
    "page",
    String(
      params.page ?? 1,
    ),
  );

  query.set(
    "per_page",
    String(
      params.per_page ?? 15,
    ),
  );

  const response =
    await apiRequest<
      ApiResponse<
        LaravelPaginator<
          PettyCashRequest
        >
      >
    >(
      `/petty-cash/requests?${query.toString()}`,
      {
        method: "GET",
      },
    );

  const data =
    unwrap(response);

  return {
    items:
      data.data ?? [],

    pagination: {
      current_page:
        data.current_page,

      last_page:
        data.last_page,

      per_page:
        data.per_page,

      total:
        data.total,
    },
  };
}

export async function createPettyCashRequest(
  payload: {
    amount: number;
    purpose: string;
  },
) {
  const response =
    await apiRequest<
      ApiResponse<PettyCashRequest>
    >(
      "/petty-cash/requests",
      {
        method: "POST",
        body:
          JSON.stringify(
            payload,
          ),
      },
    );

  return unwrap(
    response,
  );
}

export async function approvePettyCashRequest(
  id: number,
) {
  return apiRequest(
    `/petty-cash/requests/${id}/approve`,
    {
      method: "POST",
    },
  );
}

export async function rejectPettyCashRequest(
  id: number,
  reason: string,
) {
  return apiRequest(
    `/petty-cash/requests/${id}/reject`,
    {
      method: "POST",

      body:
        JSON.stringify({
          reason,
        }),
    },
  );
}

export async function cancelPettyCashRequest(
  id: number,
  reason: string,
) {
  return apiRequest(
    `/petty-cash/requests/${id}/cancel`,
    {
      method: "POST",

      body:
        JSON.stringify({
          reason,
        }),
    },
  );
}
