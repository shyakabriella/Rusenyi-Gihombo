import { apiRequest } from "@/lib/api";

import type {
  ApprovalList,
  ApprovalRequest,
  ApprovalStatus,
  ApprovalSummary,
  DashboardRole,
} from "@/types/approval";

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

export async function getApprovalRole(): Promise<DashboardRole> {
  const response = await apiRequest<
    ApiResponse<{
      role: DashboardRole;
    }>
  >("/me");

  return unwrap(response).role;
}

export async function getApprovals(
  params: {
    search?: string;
    status?: ApprovalStatus;
    module?: string;
    action?: string;
    requested_by?: number;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  } = {},
): Promise<ApprovalList> {
  const query = new URLSearchParams();

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

  const suffix = query.toString()
    ? `?${query.toString()}`
    : "";

  const response = await apiRequest<
    ApiResponse<ApprovalList>
  >(`/approvals${suffix}`);

  return unwrap(response);
}

export async function getApprovalSummary(): Promise<ApprovalSummary> {
  const response = await apiRequest<
    ApiResponse<ApprovalSummary>
  >("/approvals/summary");

  return unwrap(response);
}

export async function getApproval(
  id: number,
): Promise<ApprovalRequest> {
  const response = await apiRequest<
    ApiResponse<ApprovalRequest>
  >(`/approvals/${id}`);

  return unwrap(response);
}

export async function requestPayrollPaymentApproval(
  payrollId: number,
  requestNote?: string,
): Promise<ApprovalRequest> {
  const response = await apiRequest<
    ApiResponse<ApprovalRequest>
  >(
    `/approvals/payrolls/${payrollId}/payment`,
    {
      method: "POST",

      body: JSON.stringify({
        request_note:
          requestNote || undefined,
      }),
    },
  );

  return unwrap(response);
}

export async function approveApproval(
  id: number,
  reviewNote?: string,
): Promise<ApprovalRequest> {
  const response = await apiRequest<
    ApiResponse<ApprovalRequest>
  >(
    `/approvals/${id}/approve`,
    {
      method: "PATCH",

      body: JSON.stringify({
        review_note:
          reviewNote || undefined,
      }),
    },
  );

  return unwrap(response);
}

export async function rejectApproval(
  id: number,
  reviewNote: string,
): Promise<ApprovalRequest> {
  const response = await apiRequest<
    ApiResponse<ApprovalRequest>
  >(
    `/approvals/${id}/reject`,
    {
      method: "PATCH",

      body: JSON.stringify({
        review_note:
          reviewNote,
      }),
    },
  );

  return unwrap(response);
}

export async function cancelApproval(
  id: number,
  cancellationReason: string,
): Promise<ApprovalRequest> {
  const response = await apiRequest<
    ApiResponse<ApprovalRequest>
  >(
    `/approvals/${id}/cancel`,
    {
      method: "PATCH",

      body: JSON.stringify({
        cancellation_reason:
          cancellationReason,
      }),
    },
  );

  return unwrap(response);
}
