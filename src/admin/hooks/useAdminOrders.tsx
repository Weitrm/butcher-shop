import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";

import {
  getAdminOrdersAction,
  type GetAdminOrdersOptions,
} from "../actions/get-admin-orders.action";
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
  limit?: number;
  page?: number;
}

export const useAdminOrders = (options: Options = {}) => {
  const [searchParams] = useSearchParams();
  const useSearch = options.useSearchParams ?? true;
  const limitParam = useSearch ? searchParams.get("limit") : null;
  const pageParam = useSearch ? searchParams.get("page") : null;

  const limit = options.limit ?? (limitParam ? Number(limitParam) : 10);
  const page = options.page ?? (pageParam ? Number(pageParam) : 1);
  const safeLimit = isNaN(limit) || limit < 1 ? 10 : limit;
  const safePage = isNaN(page) || page < 1 ? 1 : page;
  const offset = (safePage - 1) * safeLimit;
  const filters = resolveAdminOrderFilters({
    searchParams,
    useSearchParams: useSearch,
    options: {
      scope: options.scope,
      status: options.status,
      hasBoxes: options.hasBoxes,
    },
  });

  const queryOptions: GetAdminOrdersOptions = {
    limit: safeLimit,
    offset,
    ...filters,
  };

  return useQuery({
    queryKey: [
      "admin-orders",
      {
        limit: safeLimit,
        offset,
        ...buildAdminOrderFiltersQueryKey(filters),
      },
    ],
    queryFn: () => getAdminOrdersAction(queryOptions),
    staleTime: 1000 * 60,
  });
};
