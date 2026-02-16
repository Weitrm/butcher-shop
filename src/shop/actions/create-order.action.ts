import { butcherApi } from "@/api/butcherApi";
import type { Order } from "@/interface/order.interface";
import { mapOrderImages } from "./order.mapper";

interface CreateOrderItem {
  productId: string;
  kg: number;
  isBox?: boolean;
}

export const createOrderAction = async (
  items: CreateOrderItem[],
): Promise<Order> => {
  const { data } = await butcherApi.post<Order>('/orders', { items });
  return mapOrderImages(data);
};
