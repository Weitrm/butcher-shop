import { butcherApi } from "@/api/butcherApi";
import type { AuthResponse } from "../interfaces/auth.response";

export const registerAction = async (
  fullName: string,
  employeeNumber: string,
  nationalId: string,
  password: string,
): Promise<AuthResponse> => {
  const { data } = await butcherApi.post<AuthResponse>(
    "/auth/register",
    { fullName, employeeNumber, nationalId, password },
  );

  return data;
};