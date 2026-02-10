import { butcherApi } from "@/api/butcherApi";
import type { Order, OrderStatus } from "@/interface/order.interface";
import { mapOrderImages } from "@/shop/actions/order.mapper";

interface UpdateOrderStatusPayload {
  orderId: string;
  status: OrderStatus;
}

export const updateOrderStatusAction = async ({
  orderId,
  status,
}: UpdateOrderStatusPayload): Promise<Order> => {
  const { data } = await butcherApi.patch<Order>(`/orders/${orderId}/status`, {
    status,
  });
  return mapOrderImages(data);
};
