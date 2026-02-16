import { useQuery } from "@tanstack/react-query";

import { getOrderSettingsAction } from "../actions/get-order-settings.action";

export const useOrderSettings = () =>
  useQuery({
    queryKey: ["order-settings"],
    queryFn: getOrderSettingsAction,
    staleTime: 1000 * 60,
  });
