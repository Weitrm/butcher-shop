import { butcherApi } from "@/api/butcherApi";
import type { Sector } from "@/interface/sector.interface";
import type { CreateSectorPayload } from "./create-sector.action";

export const updateSectorAction = async (
  sectorId: string,
  payload: Partial<CreateSectorPayload>,
): Promise<Sector> => {
  const { data } = await butcherApi.patch<Sector>(`/sectors/${sectorId}`, payload);
  return data;
};

