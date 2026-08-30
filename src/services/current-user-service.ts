import { apiRequest } from "@/lib/api";

import type { User } from "@/types/user";

type MeResponse = {
  success: boolean;
  message: string;
  data: User;
};

export async function getCurrentUser(): Promise<User> {
  const response =
    await apiRequest<MeResponse>("/me");

  return response.data;
}
