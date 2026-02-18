import { butcherApi } from "@/api/butcherApi";
import type { OrderSettings } from "@/interface/order-settings.interface";

type UpdateOrderSettingsPayload = {
  maxTotalKg: number;
  maxItems: number;
};

export const updateOrderSettingsAction = async (
  payload: UpdateOrderSettingsPayload,
): Promise<OrderSettings> => {
  const { data } = await butcherApi.patch<OrderSettings>("/orders/settings", payload);
  return data;
};
