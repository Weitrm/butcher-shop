import { butcherApi } from "@/api/butcherApi";
import type { Sector } from "@/interface/sector.interface";

export interface CreateSectorPayload {
  title: string;
  color?: string;
  isActive?: boolean;
  preparationWeekday?: number;
  maxTotalKg?: number | null;
  maxItems?: number | null;
  maxOrdersPerWeek?: number | null;
  allowAllProducts?: boolean;
  allowedProductSlugs?: string[];
}

export const createSectorAction = async (
  payload: CreateSectorPayload,
): Promise<Sector> => {
  const { data } = await butcherApi.post<Sector>("/sectors", payload);
  return data;
};
