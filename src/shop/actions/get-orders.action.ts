import { butcherApi } from "@/api/butcherApi";
import type { OrdersResponse } from "@/interface/orders.response";
import { mapOrdersImages } from "./order.mapper";

interface Options {
  limit?: number | string;
  offset?: number | string;
}

export const getOrdersAction = async (
  options: Options = {},
): Promise<OrdersResponse> => {
  const { limit, offset } = options;
  const { data } = await butcherApi.get<OrdersResponse>('/orders', {
    params: {
      limit,
      offset,
    },
  });

  return {
    ...data,
    orders: mapOrdersImages(data.orders),
  };
};
