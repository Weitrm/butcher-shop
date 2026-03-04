import type { Order } from "@/interface/order.interface";

import {
  applyLocalOrderFilters,
  getAllAdminOrdersAction,
  type GetAdminOrdersOptions,
} from "./get-admin-orders.action";

type Options = Omit<GetAdminOrdersOptions, "limit" | "offset">;

export interface AdminOrdersSummary {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
}

const createEmptySummary = (): AdminOrdersSummary => ({
  total: 0,
  pending: 0,
  completed: 0,
  cancelled: 0,
});

const appendOrdersToSummary = (summary: AdminOrdersSummary, orders: Order[]) => {
  for (const order of orders) {
    summary.total += 1;
    if (order.status === "pending") summary.pending += 1;
    if (order.status === "completed") summary.completed += 1;
    if (order.status === "cancelled") summary.cancelled += 1;
  }
};

export const getAdminOrdersSummaryAction = async (
  options: Options = {},
): Promise<AdminOrdersSummary> => {
  const summary = createEmptySummary();
  const orders = await getAllAdminOrdersAction(options);
  const filteredOrders = applyLocalOrderFilters(orders, {
    status: options.status,
    hasBoxes: options.hasBoxes,
  });

  appendOrdersToSummary(summary, filteredOrders);

  return summary;
};
