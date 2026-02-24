import { butcherApi } from "@/api/butcherApi";
import type { User } from "@/interface/user.interface";

type UpdateUserSectorPayload = {
  sectorId?: string | null;
};

export const updateUserSectorAction = async (
  userId: string,
  sectorId?: string | null,
): Promise<User> => {
  const payload: UpdateUserSectorPayload = { sectorId: sectorId || null };
  const { data } = await butcherApi.patch<User>(
    `/auth/users/${userId}/sector`,
    payload,
  );
  return data;
};

