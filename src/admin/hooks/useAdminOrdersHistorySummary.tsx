import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";

import { getAdminOrdersHistorySummaryAction } from "../actions/get-admin-orders-history-summary.action";
import type { OrderStatus } from "@/interface/order.interface";

interface Options {
  scope?: "week" | "history" | "all";
  useSearchParams?: boolean;
  status?: OrderStatus;
  hasBoxes?: boolean;
}

export const useAdminOrdersHistorySummary = (options: Options = {}) => {
  const [searchParams] = useSearchParams();
  const useSearch = options.useSearchParams ?? true;
  const userParam = useSearch ? searchParams.get("user") : null;
  const productParam = useSearch ? searchParams.get("product") : null;
  const fromDateParam = useSearch ? searchParams.get("fromDate") : null;
  const toDateParam = useSearch ? searchParams.get("toDate") : null;
  const sectorIdParam = useSearch ? searchParams.get("sectorId") : null;
  const preparationDateParam = useSearch ? searchParams.get("preparationDate") : null;
  const statusParam = useSearch ? searchParams.get("status") : null;
  const hasBoxesParam = useSearch ? searchParams.get("hasBoxes") : null;
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

  return useQuery({
    queryKey: [
      "admin-orders-history-summary",
      {
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
    queryFn: () =>
      getAdminOrdersHistorySummaryAction({
        scope,
        user: userParam || undefined,
        product: productParam || undefined,
        fromDate: fromDateParam || undefined,
        toDate: toDateParam || undefined,
        sectorId: sectorIdParam || undefined,
        preparationDate: preparationDateParam || undefined,
        status,
        hasBoxes,
      }),
    staleTime: 1000 * 60,
  });
};
