import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { getOrdersAction } from "../actions/get-orders.action";

interface Options {
  limit?: number;
  page?: number;
  useSearchParams?: boolean;
  enabled?: boolean;
}

export const useOrders = (options: Options = {}) => {
  const [searchParams] = useSearchParams();
  const useSearch = options.useSearchParams ?? true;
  const limitParam = useSearch ? searchParams.get("limit") : undefined;
  const pageParam = useSearch ? searchParams.get("page") : undefined;
  const fromDateParam = useSearch ? searchParams.get("fromDate") : undefined;
  const toDateParam = useSearch ? searchParams.get("toDate") : undefined;

  const limit =
    options.limit ?? (limitParam ? Number(limitParam) : 10);
  const page =
    options.page ?? (pageParam ? Number(pageParam) : 1);

  const safeLimit = isNaN(limit) || limit < 1 ? 10 : limit;
  const safePage = isNaN(page) || page < 1 ? 1 : page;
  const offset = (safePage - 1) * safeLimit;

  return useQuery({
    queryKey: [
      "orders",
      {
        limit: safeLimit,
        offset,
        fromDate: fromDateParam || "",
        toDate: toDateParam || "",
      },
    ],
    queryFn: () =>
      getOrdersAction({
        limit: safeLimit,
        offset,
        fromDate: fromDateParam || undefined,
        toDate: toDateParam || undefined,
      }),
    staleTime: 1000 * 60,
    enabled: options.enabled ?? true,
  });
};
