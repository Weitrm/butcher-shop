import { butcherApi } from "@/api/butcherApi";
import type { User } from "@/interface/user.interface";

type UpdateUserStatusPayload = {
  isActive: boolean;
};

export const updateUserStatusAction = async (
  userId: string,
  isActive: boolean,
): Promise<User> => {
  const payload: UpdateUserStatusPayload = { isActive };
  const { data } = await butcherApi.patch<User>(
    `/auth/users/${userId}/status`,
    payload,
  );
  return data;
};
