import { butcherApi } from "@/api/butcherApi";
import type { Order, OrderStatus } from "@/interface/order.interface";
import type { OrdersResponse } from "@/interface/orders.response";
import { mapOrdersImages } from "@/shop/actions/order.mapper";

const BULK_PAGE_SIZE = 100;

export interface GetAdminOrdersOptions {
  limit?: number | string;
  offset?: number | string;
  scope?: string;
  user?: string;
  product?: string;
  fromDate?: string;
  toDate?: string;
  sectorId?: string;
  preparationDate?: string;
  status?: OrderStatus;
  hasBoxes?: boolean;
}

const normalizeNumber = (value: number | string | undefined, fallback: number) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
};

export const applyLocalOrderFilters = (
  orders: Order[],
  filters: Pick<GetAdminOrdersOptions, "status" | "hasBoxes">,
) =>
  orders.filter((order) => {
    if (filters.status && order.status !== filters.status) {
      return false;
    }

    if (filters.hasBoxes === true && !order.items.some((item) => item.isBox)) {
      return false;
    }

    return true;
  });

export const getAdminOrdersAction = async (
  options: GetAdminOrdersOptions = {},
): Promise<OrdersResponse> => {
  const {
    limit,
    offset,
    scope,
    user,
    product,
    fromDate,
    toDate,
    sectorId,
    preparationDate,
  } = options;
  const { data } = await butcherApi.get<OrdersResponse>("/orders/admin", {
    params: {
      limit,
      offset,
      scope,
      user,
      product,
      fromDate,
      toDate,
      sectorId,
      preparationDate,
    },
  });

  return {
    ...data,
    orders: mapOrdersImages(data.orders),
  };
};

export const getAllAdminOrdersAction = async (
  options: Omit<GetAdminOrdersOptions, "limit" | "offset"> = {},
): Promise<Order[]> => {
  const orders: Order[] = [];
  let offset = 0;
  let totalOrders = 0;

  do {
    const response = await getAdminOrdersAction({
      ...options,
      limit: BULK_PAGE_SIZE,
      offset,
    });

    totalOrders = response.count;
    orders.push(...response.orders);
    offset += BULK_PAGE_SIZE;
  } while (offset < totalOrders);

  return orders;
};

export const getAdminOrdersWithLocalFiltersAction = async (
  options: GetAdminOrdersOptions = {},
): Promise<OrdersResponse> => {
  const { status, hasBoxes, limit, offset, ...baseOptions } = options;

  if (!status && hasBoxes !== true) {
    return getAdminOrdersAction(options);
  }

  const allOrders = await getAllAdminOrdersAction(baseOptions);
  const filteredOrders = applyLocalOrderFilters(allOrders, { status, hasBoxes });
  const safeLimit = Math.max(1, normalizeNumber(limit, filteredOrders.length || BULK_PAGE_SIZE));
  const safeOffset = Math.max(0, normalizeNumber(offset, 0));

  return {
    count: filteredOrders.length,
    pages: Math.max(1, Math.ceil(filteredOrders.length / safeLimit)),
    orders: filteredOrders.slice(safeOffset, safeOffset + safeLimit),
  };
};
