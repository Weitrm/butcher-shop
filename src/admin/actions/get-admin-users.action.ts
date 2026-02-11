import { butcherApi } from "@/api/butcherApi";
import type { User } from "@/interface/user.interface";

export const getAdminUsersAction = async (): Promise<User[]> => {
  const { data } = await butcherApi.get<User[]>("/auth/users");
  return data;
};
