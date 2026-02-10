import { useQuery } from "@tanstack/react-query";
import { getCurrentOrderAction } from "../actions/get-current-order.action";

export const useCurrentOrder = (enabled = true) =>
  useQuery({
    queryKey: ['orders', 'current'],
    queryFn: getCurrentOrderAction,
    staleTime: 1000 * 60,
    enabled,
    retry: false,
  });
