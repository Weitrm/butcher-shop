import { butcherApi } from "@/api/butcherApi";

import { type GetAdminOrdersOptions } from "./get-admin-orders.action";

type Options = Omit<GetAdminOrdersOptions, "limit" | "offset">;

export interface AdminOrdersSummary {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
}

export const getAdminOrdersSummaryAction = async (
  options: Options = {},
): Promise<AdminOrdersSummary> => {
  const { data } = await butcherApi.get<AdminOrdersSummary>("/orders/admin/summary", {
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
  });

  return data;
};
