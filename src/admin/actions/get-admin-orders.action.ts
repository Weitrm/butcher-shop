import { butcherApi } from "@/api/butcherApi";
import type { Order } from "@/interface/order.interface";
import { mapOrdersImages } from "@/shop/actions/order.mapper";

export const getAdminOrdersAction = async (): Promise<Order[]> => {
  const { data } = await butcherApi.get<Order[]>("/orders/admin");
  return mapOrdersImages(data);
};
