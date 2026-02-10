import { butcherApi } from "@/api/butcherApi";
import type { Order } from "@/interface/order.interface";
import { mapOrdersImages } from "./order.mapper";

export const getOrdersAction = async (): Promise<Order[]> => {
  const { data } = await butcherApi.get<Order[]>('/orders');
  return mapOrdersImages(data);
};
