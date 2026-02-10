import { butcherApi } from "@/api/butcherApi";
import type { DashboardStats } from "@/interface/dashboard.interface";

interface Options {
  query?: string;
  limit?: number;
  offset?: number;
}

export const getDashboardStatsAction = async ({
  query,
  limit,
  offset,
}: Options): Promise<DashboardStats> => {
  const { data } = await butcherApi.get<DashboardStats>(
    "/orders/admin/dashboard",
    {
      params: {
        q: query || undefined,
        limit,
        offset,
      },
    },
  );

  return data;
};
