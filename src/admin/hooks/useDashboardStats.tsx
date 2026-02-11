import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getDashboardStatsAction } from "../actions/get-dashboard-stats.action";

interface Options {
  query: string;
  limit: number;
  offset: number;
  range?: "week" | "month" | "year";
}

export const useDashboardStats = ({
  query,
  limit,
  offset,
  range = "week",
}: Options) =>
  useQuery({
    queryKey: ["admin-dashboard", { query, limit, offset, range }],
    queryFn: () => getDashboardStatsAction({ query, limit, offset, range }),
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60 * 3,
    placeholderData: keepPreviousData,
  });
