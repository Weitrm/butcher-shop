import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { getAdminOrdersAction } from "../actions/get-admin-orders.action";

interface Options {
  scope?: "week" | "history" | "all";
  useSearchParams?: boolean;
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

  const limit = limitParam ? Number(limitParam) : 10;
  const page = pageParam ? Number(pageParam) : 1;
  const safeLimit = isNaN(limit) || limit < 1 ? 10 : limit;
  const safePage = isNaN(page) || page < 1 ? 1 : page;
  const offset = (safePage - 1) * safeLimit;
  const scope = options.scope || "all";

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
      },
    ],
    queryFn: () =>
      getAdminOrdersAction({
        limit: safeLimit,
        offset,
        scope,
        user: userParam || undefined,
        product: productParam || undefined,
        fromDate: fromDateParam || undefined,
        toDate: toDateParam || undefined,
      }),
    staleTime: 1000 * 60,
  });
};
