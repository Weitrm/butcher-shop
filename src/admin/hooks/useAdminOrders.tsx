import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";

import {
  getAdminOrdersWithLocalFiltersAction,
  type GetAdminOrdersOptions,
} from "../actions/get-admin-orders.action";
import type { OrderStatus } from "@/interface/order.interface";

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
  const userParam = useSearch ? searchParams.get("user") : null;
  const productParam = useSearch ? searchParams.get("product") : null;
  const fromDateParam = useSearch ? searchParams.get("fromDate") : null;
  const toDateParam = useSearch ? searchParams.get("toDate") : null;
  const sectorIdParam = useSearch ? searchParams.get("sectorId") : null;
  const preparationDateParam = useSearch ? searchParams.get("preparationDate") : null;
  const statusParam = useSearch ? searchParams.get("status") : null;
  const hasBoxesParam = useSearch ? searchParams.get("hasBoxes") : null;

  const limit = options.limit ?? (limitParam ? Number(limitParam) : 10);
  const page = options.page ?? (pageParam ? Number(pageParam) : 1);
  const safeLimit = isNaN(limit) || limit < 1 ? 10 : limit;
  const safePage = isNaN(page) || page < 1 ? 1 : page;
  const offset = (safePage - 1) * safeLimit;
  const scope = options.scope || "all";
  const status =
    options.status ??
    (statusParam === "pending" || statusParam === "completed" || statusParam === "cancelled"
      ? statusParam
      : undefined);
  const hasBoxes =
    typeof options.hasBoxes === "boolean"
      ? options.hasBoxes
      : hasBoxesParam === "true"
        ? true
        : undefined;

  const queryOptions: GetAdminOrdersOptions = {
    limit: safeLimit,
    offset,
    scope,
    user: userParam || undefined,
    product: productParam || undefined,
    fromDate: fromDateParam || undefined,
    toDate: toDateParam || undefined,
    sectorId: sectorIdParam || undefined,
    preparationDate: preparationDateParam || undefined,
    status,
    hasBoxes,
  };

  return useQuery({
    queryKey: [
      "admin-orders",
      {
        limit: safeLimit,
        offset,
        scope,
        user: userParam || "",
        product: productParam || "",
        fromDate: fromDateParam || "",
        toDate: toDateParam || "",
        sectorId: sectorIdParam || "",
        preparationDate: preparationDateParam || "",
        status: status || "",
        hasBoxes: hasBoxes ? "true" : "",
      },
    ],
    queryFn: () => getAdminOrdersWithLocalFiltersAction(queryOptions),
    staleTime: 1000 * 60,
  });
};
