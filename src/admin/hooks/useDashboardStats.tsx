import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getDashboardStatsAction } from "../actions/get-dashboard-stats.action";

interface Options {
  query: string;
  limit: number;
  offset: number;
}

export const useDashboardStats = ({ query, limit, offset }: Options) =>
  useQuery({
    queryKey: ["admin-dashboard", { query, limit, offset }],
    queryFn: () => getDashboardStatsAction({ query, limit, offset }),
    staleTime: 1000 * 60,
    placeholderData: keepPreviousData,
  });
