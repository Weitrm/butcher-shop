import { butcherApi } from "@/api/butcherApi";
import type { User } from "@/interface/user.interface";

type UpdateUserPasswordPayload = {
  password: string;
};

export const updateUserPasswordAction = async (
  userId: string,
  password: string,
): Promise<User> => {
  const payload: UpdateUserPasswordPayload = { password };
  const { data } = await butcherApi.patch<User>(
    `/auth/users/${userId}/password`,
    payload,
  );
  return data;
};
