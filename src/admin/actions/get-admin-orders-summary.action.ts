import type { Order } from "@/interface/order.interface";
import { getAdminOrdersAction } from "./get-admin-orders.action";

interface Options {
  scope?: string;
  user?: string;
  product?: string;
  fromDate?: string;
  toDate?: string;
}

export interface AdminOrdersSummary {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
}

const SUMMARY_PAGE_SIZE = 100;

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
  let offset = 0;
  let totalOrders = 0;

  do {
    const response = await getAdminOrdersAction({
      ...options,
      limit: SUMMARY_PAGE_SIZE,
      offset,
    });

    totalOrders = response.count;
    appendOrdersToSummary(summary, response.orders);
    offset += SUMMARY_PAGE_SIZE;
  } while (offset < totalOrders);

  return summary;
};
