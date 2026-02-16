import { butcherApi } from "@/api/butcherApi";
import type { User } from "@/interface/user.interface";

type UpdateUserSuperUserPayload = {
  isSuperUser: boolean;
};

export const updateUserSuperUserAction = async (
  userId: string,
  isSuperUser: boolean,
): Promise<User> => {
  const payload: UpdateUserSuperUserPayload = { isSuperUser };
  const { data } = await butcherApi.patch<User>(
    `/auth/users/${userId}/super-user`,
    payload,
  );
  return data;
};
