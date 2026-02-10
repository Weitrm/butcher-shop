import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { getAdminOrdersAction } from "../actions/get-admin-orders.action";

export const useAdminOrders = () => {
  const [searchParams] = useSearchParams();
  const limitParam = searchParams.get("limit") || 10;
  const pageParam = searchParams.get("page") || 1;
  const limit = isNaN(+limitParam) ? 10 : Number(limitParam);
  const page = isNaN(+pageParam) ? 1 : Number(pageParam);
  const offset = (page - 1) * limit;

  return useQuery({
    queryKey: ["admin-orders", { limit, offset }],
    queryFn: () =>
      getAdminOrdersAction({
        limit,
        offset,
      }),
    staleTime: 1000 * 60,
  });
};
