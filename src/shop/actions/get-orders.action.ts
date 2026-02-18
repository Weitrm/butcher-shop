import { butcherApi } from "@/api/butcherApi";
import type { OrdersResponse } from "@/interface/orders.response";
import { mapOrdersImages } from "./order.mapper";

interface Options {
  limit?: number | string;
  offset?: number | string;
  fromDate?: string;
  toDate?: string;
}

export const getOrdersAction = async (
  options: Options = {},
): Promise<OrdersResponse> => {
  const { limit, offset, fromDate, toDate } = options;
  const { data } = await butcherApi.get<OrdersResponse>('/orders', {
    params: {
      limit,
      offset,
      fromDate,
      toDate,
    },
  });

  return {
    ...data,
    orders: mapOrdersImages(data.orders),
  };
};
