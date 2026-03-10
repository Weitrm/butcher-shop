import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";

import { getAdminOrdersHistorySummaryAction } from "../actions/get-admin-orders-history-summary.action";
import type { OrderStatus } from "@/interface/order.interface";
import {
  buildAdminOrderFiltersQueryKey,
  resolveAdminOrderFilters,
} from "./adminOrdersFilters";

interface Options {
  scope?: "week" | "history" | "all";
  useSearchParams?: boolean;
  status?: OrderStatus;
  hasBoxes?: boolean;
}

export const useAdminOrdersHistorySummary = (options: Options = {}) => {
  const [searchParams] = useSearchParams();
  const useSearch = options.useSearchParams ?? true;
  const filters = resolveAdminOrderFilters({
    searchParams,
    useSearchParams: useSearch,
    options: {
      scope: options.scope,
      status: options.status,
      hasBoxes: options.hasBoxes,
    },
  });

  return useQuery({
    queryKey: [
      "admin-orders-history-summary",
      buildAdminOrderFiltersQueryKey(filters),
    ],
    queryFn: () =>
      getAdminOrdersHistorySummaryAction({
        ...filters,
      }),
    staleTime: 1000 * 60,
  });
};
