import { apiRequest } from "@/lib/api";

import type {
  DashboardRole,
  Expense,
  ExpenseList,
  ExpensePaymentMethod,
  ExpenseStatus,
  ExpenseSummary,
} from "@/types/expense";

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

export async function getExpenseRole(): Promise<DashboardRole> {
  const response = await apiRequest<
    ApiResponse<{
      role: DashboardRole;
    }>
  >("/me");

  return unwrap(response).role;
}

export async function getExpenses(
  params: {
    search?: string;
    status?: ExpenseStatus;
    category?: string;
    payment_method?: ExpensePaymentMethod;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  } = {},
): Promise<ExpenseList> {
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

  const response = await apiRequest<
    ApiResponse<ExpenseList>
  >(`/expenses${suffix}`);

  return unwrap(response);
}

export async function getExpenseSummary(): Promise<ExpenseSummary> {
  const response = await apiRequest<
    ApiResponse<ExpenseSummary>
  >("/expenses/summary");

  return unwrap(response);
}

export async function getExpenseCategories(): Promise<
  string[]
> {
  const response = await apiRequest<
    ApiResponse<{
      items: string[];
    }>
  >("/expenses/categories");

  return unwrap(response).items;
}

export async function getExpense(
  id: number,
): Promise<Expense> {
  const response = await apiRequest<
    ApiResponse<Expense>
  >(`/expenses/${id}`);

  return unwrap(response);
}

export async function createExpense(
  payload: {
    expense_date: string;
    category: string;
    payee_name: string;
    description: string;
    amount: number;
    payment_method: ExpensePaymentMethod;
    payment_reference?: string;
    receipt_number?: string;
    notes?: string;
  },
): Promise<Expense> {
  const response = await apiRequest<
    ApiResponse<Expense>
  >(
    "/expenses",
    {
      method: "POST",

      body: JSON.stringify(
        payload,
      ),
    },
  );

  return unwrap(response);
}

export async function updateExpense(
  id: number,
  payload: {
    expense_date?: string;
    category?: string;
    payee_name?: string;
    description?: string;
    amount?: number;
    payment_method?: ExpensePaymentMethod;
    payment_reference?: string | null;
    receipt_number?: string | null;
    notes?: string | null;
  },
): Promise<Expense> {
  const response = await apiRequest<
    ApiResponse<Expense>
  >(
    `/expenses/${id}`,
    {
      method: "PUT",

      body: JSON.stringify(
        payload,
      ),
    },
  );

  return unwrap(response);
}

export async function recordExpense(
  id: number,
): Promise<Expense> {
  const response = await apiRequest<
    ApiResponse<Expense>
  >(
    `/expenses/${id}/record`,
    {
      method: "PATCH",
    },
  );

  return unwrap(response);
}

export async function cancelExpense(
  id: number,
  cancellationReason: string,
): Promise<Expense> {
  const response = await apiRequest<
    ApiResponse<Expense>
  >(
    `/expenses/${id}/cancel`,
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
