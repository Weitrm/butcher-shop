import { butcherApi } from "@/api/butcherApi";

import { type GetAdminOrdersOptions } from "./get-admin-orders.action";

type Options = Omit<GetAdminOrdersOptions, "limit" | "offset">;

export interface AdminOrdersHistorySummary {
  total: number;
  totalKg: number;
  totalBoxes: number;
  totalPrice: number;
  completed: number;
  hasBoxOrders: boolean;
}

export const getAdminOrdersHistorySummaryAction = async (
  options: Options = {},
): Promise<AdminOrdersHistorySummary> => {
  const { data } = await butcherApi.get<AdminOrdersHistorySummary>(
    "/orders/admin/history-summary",
    {
      params: {
        scope: options.scope,
        user: options.user,
        product: options.product,
        fromDate: options.fromDate,
        toDate: options.toDate,
        sectorId: options.sectorId,
        preparationDate: options.preparationDate,
        status: options.status,
        hasBoxes: typeof options.hasBoxes === "boolean" ? options.hasBoxes : undefined,
      },
    },
  );

  return data;
};
