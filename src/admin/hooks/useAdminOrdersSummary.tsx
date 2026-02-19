import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { getAdminOrdersSummaryAction } from "../actions/get-admin-orders-summary.action";

interface Options {
  scope?: "week" | "history" | "all";
  useSearchParams?: boolean;
}

export const useAdminOrdersSummary = (options: Options = {}) => {
  const [searchParams] = useSearchParams();
  const useSearch = options.useSearchParams ?? true;
  const userParam = useSearch ? searchParams.get("user") : null;
  const productParam = useSearch ? searchParams.get("product") : null;
  const fromDateParam = useSearch ? searchParams.get("fromDate") : null;
  const toDateParam = useSearch ? searchParams.get("toDate") : null;
  const scope = options.scope || "all";

  return useQuery({
    queryKey: [
      "admin-orders-summary",
      {
        scope,
        user: userParam || "",
        product: productParam || "",
        fromDate: fromDateParam || "",
        toDate: toDateParam || "",
      },
    ],
    queryFn: () =>
      getAdminOrdersSummaryAction({
        scope,
        user: userParam || undefined,
        product: productParam || undefined,
        fromDate: fromDateParam || undefined,
        toDate: toDateParam || undefined,
      }),
    staleTime: 1000 * 60,
  });
};
