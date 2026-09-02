import { apiRequest } from "@/lib/api";

import type {
  ApprovalReport,
  FinanceReport,
  OperationsReport,
  PayrollReport,
  ReportOverview,
} from "@/types/report";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type ReportFilters = {
  date_from?: string;
  date_to?: string;
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
  filters: ReportFilters = {},
) {
  const params =
    new URLSearchParams();

  if (filters.date_from) {
    params.set(
      "date_from",
      filters.date_from,
    );
  }

  if (filters.date_to) {
    params.set(
      "date_to",
      filters.date_to,
    );
  }

  const value =
    params.toString();

  return value
    ? `?${value}`
    : "";
}

export async function getReportOverview(
  filters: ReportFilters = {},
): Promise<ReportOverview> {
  const response =
    await apiRequest<
      ApiResponse<ReportOverview>
    >(
      `/reports/overview${queryString(
        filters,
      )}`,
    );

  return unwrap(response);
}

export async function getFinanceReport(
  filters: ReportFilters = {},
): Promise<FinanceReport> {
  const response =
    await apiRequest<
      ApiResponse<FinanceReport>
    >(
      `/reports/finance${queryString(
        filters,
      )}`,
    );

  return unwrap(response);
}

export async function getPayrollReport(
  filters: ReportFilters = {},
): Promise<PayrollReport> {
  const response =
    await apiRequest<
      ApiResponse<PayrollReport>
    >(
      `/reports/payroll${queryString(
        filters,
      )}`,
    );

  return unwrap(response);
}

export async function getApprovalReport(
  filters: ReportFilters = {},
): Promise<ApprovalReport> {
  const response =
    await apiRequest<
      ApiResponse<ApprovalReport>
    >(
      `/reports/approvals${queryString(
        filters,
      )}`,
    );

  return unwrap(response);
}

export async function getOperationsReport(
  filters: ReportFilters = {},
): Promise<OperationsReport> {
  const response =
    await apiRequest<
      ApiResponse<OperationsReport>
    >(
      `/reports/operations${queryString(
        filters,
      )}`,
    );

  return unwrap(response);
}
