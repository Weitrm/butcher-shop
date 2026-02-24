import { butcherApi } from "@/api/butcherApi";
import type { Sector } from "@/interface/sector.interface";

export const getAdminSectorsAction = async (): Promise<Sector[]> => {
  const { data } = await butcherApi.get<Sector[]>("/sectors");
  return data;
};

