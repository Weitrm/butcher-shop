import { butcherApi } from "@/api/butcherApi";
import type { OrdersResponse } from "@/interface/orders.response";
import { mapOrdersImages } from "@/shop/actions/order.mapper";

interface Options {
  limit?: number | string;
  offset?: number | string;
  scope?: string;
  user?: string;
  product?: string;
  fromDate?: string;
  toDate?: string;
}

export const getAdminOrdersAction = async (
  options: Options = {},
): Promise<OrdersResponse> => {
  const { limit, offset, scope, user, product, fromDate, toDate } = options;
  const { data } = await butcherApi.get<OrdersResponse>("/orders/admin", {
    params: {
      limit,
      offset,
      scope,
      user,
      product,
      fromDate,
      toDate,
    },
  });

  return {
    ...data,
    orders: mapOrdersImages(data.orders),
  };
};
