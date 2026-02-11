import { butcherApi } from "@/api/butcherApi";
import type { DashboardStats } from "@/interface/dashboard.interface";

interface Options {
  query?: string;
  limit?: number;
  offset?: number;
  range?: "week" | "month" | "year";
}

export const getDashboardStatsAction = async ({
  query,
  limit,
  offset,
  range,
}: Options): Promise<DashboardStats> => {
  const { data } = await butcherApi.get<DashboardStats>(
    "/orders/admin/dashboard",
    {
      params: {
        q: query || undefined,
        limit,
        offset,
        range,
      },
    },
  );

  return data;
};
