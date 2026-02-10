import { useQuery } from "@tanstack/react-query";
import { getOrdersAction } from "../actions/get-orders.action";

export const useOrders = () =>
  useQuery({
    queryKey: ['orders'],
    queryFn: getOrdersAction,
    staleTime: 1000 * 60,
  });
