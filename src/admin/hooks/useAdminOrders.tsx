import { useQuery } from "@tanstack/react-query";
import { getAdminOrdersAction } from "../actions/get-admin-orders.action";

export const useAdminOrders = () =>
  useQuery({
    queryKey: ["admin-orders"],
    queryFn: getAdminOrdersAction,
    staleTime: 1000 * 60,
  });
