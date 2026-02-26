import { butcherApi } from "@/api/butcherApi";
import type { User } from "@/interface/user.interface";

type UpdateUserAdminPayload = {
  isAdmin: boolean;
};

export const updateUserAdminAction = async (
  userId: string,
  isAdmin: boolean,
): Promise<User> => {
  const payload: UpdateUserAdminPayload = { isAdmin };
  const { data } = await butcherApi.patch<User>(
    `/auth/users/${userId}/admin`,
    payload,
  );
  return data;
};
