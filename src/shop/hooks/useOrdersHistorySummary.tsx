import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";

import { getOrdersHistorySummaryAction } from "../actions/get-orders-history-summary.action";

interface Options {
  useSearchParams?: boolean;
  enabled?: boolean;
  fromDate?: string;
  toDate?: string;
}

export const useOrdersHistorySummary = (options: Options = {}) => {
  const [searchParams] = useSearchParams();
  const useSearch = options.useSearchParams ?? true;
  const fromDateParam = useSearch ? searchParams.get("fromDate") : undefined;
  const toDateParam = useSearch ? searchParams.get("toDate") : undefined;

  const resolvedFromDate = options.fromDate ?? fromDateParam ?? undefined;
  const resolvedToDate = options.toDate ?? toDateParam ?? undefined;

  return useQuery({
    queryKey: [
      "orders-history-summary",
      { fromDate: resolvedFromDate || "", toDate: resolvedToDate || "" },
    ],
    queryFn: () =>
      getOrdersHistorySummaryAction({
        fromDate: resolvedFromDate,
        toDate: resolvedToDate,
      }),
    staleTime: 1000 * 60,
    enabled: options.enabled ?? true,
  });
};
