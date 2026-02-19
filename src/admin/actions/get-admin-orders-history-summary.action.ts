import { getAdminOrdersAction } from "./get-admin-orders.action";
import { getOrderUnits, isOrderPriceAvailable } from "@/lib/order-unit";

interface Options {
  scope?: string;
  user?: string;
  product?: string;
  fromDate?: string;
  toDate?: string;
}

export interface AdminOrdersHistorySummary {
  total: number;
  totalKg: number;
  totalBoxes: number;
  totalPrice: number;
  completed: number;
  hasBoxOrders: boolean;
}

const SUMMARY_PAGE_SIZE = 100;

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
  let offset = 0;
  let totalOrders = 0;

  do {
    const response = await getAdminOrdersAction({
      ...options,
      limit: SUMMARY_PAGE_SIZE,
      offset,
    });

    totalOrders = response.count;

    for (const order of response.orders) {
      const units = getOrderUnits(order.items);
      summary.total += 1;
      summary.totalKg += units.totalKg;
      summary.totalBoxes += units.totalBoxes;
      summary.totalPrice += order.totalPrice;
      if (!isOrderPriceAvailable(order.items)) summary.hasBoxOrders = true;
      if (order.status === "completed") summary.completed += 1;
    }

    offset += SUMMARY_PAGE_SIZE;
  } while (offset < totalOrders);

  return summary;
};
