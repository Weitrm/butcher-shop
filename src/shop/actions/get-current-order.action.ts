import axios from "axios";

import { butcherApi } from "@/api/butcherApi";
import type { Order } from "@/interface/order.interface";
import { mapOrderImages } from "./order.mapper";

export const getCurrentOrderAction = async (): Promise<Order | null> => {
  try {
    const { data } = await butcherApi.get<Order>('/orders/current');
    return mapOrderImages(data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};
