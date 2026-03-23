import { butcherApi } from "@/api/butcherApi";
import type { OrderStatus } from "@/interface/order.interface";
import type { OrdersResponse } from "@/interface/orders.response";
import { mapOrdersImages } from "@/shop/actions/order.mapper";

export interface GetAdminOrdersOptions {
  limit?: number | string;
  offset?: number | string;
  scope?: string;
  sort?: "default" | "statusEmployeeAsc";
  user?: string;
  product?: string;
  fromDate?: string;
  toDate?: string;
  sectorId?: string;
  preparationDate?: string;
  status?: OrderStatus;
  hasBoxes?: boolean;
}

export const getAdminOrdersAction = async (
  options: GetAdminOrdersOptions = {},
): Promise<OrdersResponse> => {
  const {
    limit,
    offset,
    scope,
    sort,
    user,
    product,
    fromDate,
    toDate,
    sectorId,
    preparationDate,
    status,
    hasBoxes,
  } = options;
  const { data } = await butcherApi.get<OrdersResponse>("/orders/admin", {
    params: {
      limit,
      offset,
      scope,
      sort,
      user,
      product,
      fromDate,
      toDate,
      sectorId,
      preparationDate,
      status,
      hasBoxes: typeof hasBoxes === "boolean" ? hasBoxes : undefined,
    },
  });

  return {
    ...data,
    orders: mapOrdersImages(data.orders),
  };
};
