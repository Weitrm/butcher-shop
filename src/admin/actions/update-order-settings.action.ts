import { butcherApi } from "@/api/butcherApi";
import type { OrderSettings } from "@/interface/order-settings.interface";

type UpdateOrderSettingsPayload = {
  maxTotalKg: number;
};

export const updateOrderSettingsAction = async (
  maxTotalKg: number,
): Promise<OrderSettings> => {
  const payload: UpdateOrderSettingsPayload = { maxTotalKg };
  const { data } = await butcherApi.patch<OrderSettings>("/orders/settings", payload);
  return data;
};
