import { getOrderUnits, isOrderPriceAvailable } from "@/lib/order-unit";

import {
  applyLocalOrderFilters,
  getAllAdminOrdersAction,
  type GetAdminOrdersOptions,
} from "./get-admin-orders.action";

type Options = Omit<GetAdminOrdersOptions, "limit" | "offset">;

export interface AdminOrdersHistorySummary {
  total: number;
  totalKg: number;
  totalBoxes: number;
  totalPrice: number;
  completed: number;
  hasBoxOrders: boolean;
}

const createEmptySummary = (): AdminOrdersHistorySummary => ({
  total: 0,
  totalKg: 0,
  totalBoxes: 0,
  totalPrice: 0,
  completed: 0,
  hasBoxOrders: false,
});

export const getAdminOrdersHistorySummaryAction = async (
  options: Options = {},
): Promise<AdminOrdersHistorySummary> => {
  const summary = createEmptySummary();
  const orders = await getAllAdminOrdersAction(options);
  const filteredOrders = applyLocalOrderFilters(orders, {
    status: options.status,
    hasBoxes: options.hasBoxes,
  });

  for (const order of filteredOrders) {
    const units = getOrderUnits(order.items);
    summary.total += 1;
    summary.totalKg += units.totalKg;
    summary.totalBoxes += units.totalBoxes;
    summary.totalPrice += order.totalPrice;
    if (!isOrderPriceAvailable(order.items)) summary.hasBoxOrders = true;
    if (order.status === "completed") summary.completed += 1;
  }

  return summary;
};
