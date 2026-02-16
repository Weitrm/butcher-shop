import { butcherApi } from "@/api/butcherApi";
import type { OrderSettings } from "@/interface/order-settings.interface";

export const getOrderSettingsAction = async (): Promise<OrderSettings> => {
  const { data } = await butcherApi.get<OrderSettings>("/orders/settings");
  return data;
};
