import { butcherApi } from "@/api/butcherApi";
import type { User } from "@/interface/user.interface";

export type CreateUserWeeklyOrderExceptionPayload = {
  userId: string;
  extraOrders: number;
  reason?: string;
};

type CreateUserWeeklyOrderExceptionRequest = {
  extraOrders: number;
  reason?: string;
};

export const createUserWeeklyOrderExceptionAction = async ({
  userId,
  extraOrders,
  reason,
}: CreateUserWeeklyOrderExceptionPayload): Promise<User> => {
  const payload: CreateUserWeeklyOrderExceptionRequest = {
    extraOrders,
    reason: reason?.trim() || undefined,
  };
  const { data } = await butcherApi.post<User>(
    `/auth/users/${userId}/weekly-order-exceptions`,
    payload,
  );
  return data;
};
