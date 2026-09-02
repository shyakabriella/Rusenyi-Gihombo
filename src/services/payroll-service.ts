import { apiRequest } from "@/lib/api";

import type {
  DashboardRole,
  Payroll,
  PayrollEmployee,
  PayrollList,
  PayrollPaymentMethod,
  PayrollStatus,
  PayrollSummary,
} from "@/types/payroll";

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

export async function getPayrollRole(): Promise<DashboardRole> {
  const response = await apiRequest<
    ApiResponse<{
      role: DashboardRole;
    }>
  >("/me");

  return unwrap(response).role;
}

export async function getPayrolls(
  params: {
    search?: string;
    status?: PayrollStatus;
    payroll_month?: string;
    employee_id?: number;
    page?: number;
    per_page?: number;
  } = {},
): Promise<PayrollList> {
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
    ApiResponse<PayrollList>
  >(`/payrolls${suffix}`);

  return unwrap(response);
}

export async function getPayrollSummary(
  payrollMonth?: string,
): Promise<PayrollSummary> {
  const suffix = payrollMonth
    ? `?payroll_month=${encodeURIComponent(
        payrollMonth,
      )}`
    : "";

  const response = await apiRequest<
    ApiResponse<PayrollSummary>
  >(`/payrolls/summary${suffix}`);

  return unwrap(response);
}

export async function getPayrollEmployees(): Promise<
  PayrollEmployee[]
> {
  const response = await apiRequest<
    ApiResponse<{
      items: PayrollEmployee[];
    }>
  >("/payrolls/employee-lookup");

  return unwrap(response).items;
}

export async function getPayroll(
  id: number,
): Promise<Payroll> {
  const response = await apiRequest<
    ApiResponse<Payroll>
  >(`/payrolls/${id}`);

  return unwrap(response);
}

export async function createPayroll(
  payload: {
    employee_id: number;
    payroll_month: string;
    basic_salary: number;
    allowances?: number;
    deductions?: number;
    notes?: string;
  },
): Promise<Payroll> {
  const response = await apiRequest<
    ApiResponse<Payroll>
  >(
    "/payrolls",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return unwrap(response);
}

export async function updatePayroll(
  id: number,
  payload: {
    employee_id?: number;
    payroll_month?: string;
    basic_salary?: number;
    allowances?: number;
    deductions?: number;
    notes?: string | null;
  },
): Promise<Payroll> {
  const response = await apiRequest<
    ApiResponse<Payroll>
  >(
    `/payrolls/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );

  return unwrap(response);
}

export async function processPayroll(
  id: number,
): Promise<Payroll> {
  const response = await apiRequest<
    ApiResponse<Payroll>
  >(
    `/payrolls/${id}/process`,
    {
      method: "PATCH",
    },
  );

  return unwrap(response);
}

export async function payPayroll(
  id: number,
  payload: {
    payment_method: PayrollPaymentMethod;
    payment_reference?: string;
    payment_date: string;
  },
): Promise<Payroll> {
  const response = await apiRequest<
    ApiResponse<Payroll>
  >(
    `/payrolls/${id}/pay`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );

  return unwrap(response);
}

export async function cancelPayroll(
  id: number,
  cancellationReason: string,
): Promise<Payroll> {
  const response = await apiRequest<
    ApiResponse<Payroll>
  >(
    `/payrolls/${id}/cancel`,
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
