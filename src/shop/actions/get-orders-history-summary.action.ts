import { butcherApi } from "@/api/butcherApi";
import type { Order } from "@/interface/order.interface";
import type { OrdersResponse } from "@/interface/orders.response";
import { getOrderUnits, isOrderPriceAvailable } from "@/lib/order-unit";

interface Options {
  fromDate?: string;
  toDate?: string;
}

export interface OrdersHistorySummary {
  total: number;
  totalKg: number;
  totalBoxes: number;
  totalPrice: number;
  pending: number;
  hasBoxOrders: boolean;
}

const ORDERS_HISTORY_SUMMARY_PAGE_SIZE = 100;

const createEmptySummary = (): OrdersHistorySummary => ({
  total: 0,
  totalKg: 0,
  totalBoxes: 0,
  totalPrice: 0,
  pending: 0,
  hasBoxOrders: false,
});

const appendOrderToSummary = (summary: OrdersHistorySummary, order: Order) => {
  if (order.status === "cancelled") return;

  const units = getOrderUnits(order.items);
  summary.total += 1;
  summary.totalKg += units.totalKg;
  summary.totalBoxes += units.totalBoxes;
  summary.totalPrice += order.totalPrice;
  if (!isOrderPriceAvailable(order.items)) summary.hasBoxOrders = true;
  if (order.status === "pending") summary.pending += 1;
};

const appendOrdersToSummary = (summary: OrdersHistorySummary, orders: Order[]) => {
  orders.forEach((order) => appendOrderToSummary(summary, order));
};

export const getOrdersHistorySummaryAction = async (
  options: Options = {},
): Promise<OrdersHistorySummary> => {
  const { fromDate, toDate } = options;

  const summary = createEmptySummary();
  let offset = 0;
  let count = 0;

  do {
    const { data } = await butcherApi.get<OrdersResponse>("/orders", {
      params: {
        limit: ORDERS_HISTORY_SUMMARY_PAGE_SIZE,
        offset,
        fromDate,
        toDate,
      },
    });

    const { orders } = data;
    count = data.count;

    appendOrdersToSummary(summary, orders);

    if (orders.length === 0) break;

    offset += orders.length;
  } while (offset < count);

  return summary;
};
