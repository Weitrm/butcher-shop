import { butcherApi } from "@/api/butcherApi";
import type { OrdersResponse } from "@/interface/orders.response";
import { mapOrdersImages } from "@/shop/actions/order.mapper";

interface Options {
  limit?: number | string;
  offset?: number | string;
}

export const getAdminOrdersAction = async (
  options: Options = {},
): Promise<OrdersResponse> => {
  const { limit, offset } = options;
  const { data } = await butcherApi.get<OrdersResponse>("/orders/admin", {
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
