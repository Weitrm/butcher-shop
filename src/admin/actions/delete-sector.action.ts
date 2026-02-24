import { butcherApi } from "@/api/butcherApi";

export const deleteSectorAction = async (sectorId: string): Promise<{ id: string }> => {
  const { data } = await butcherApi.delete<{ id: string }>(`/sectors/${sectorId}`);
  return data;
};

