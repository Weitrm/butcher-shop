import { butcherApi } from "@/api/butcherApi";

export const deleteProductAction = async (productId: string): Promise<void> => {
    if (!productId) throw new Error('ID del producto es requerido');

    await butcherApi.delete(`/products/${productId}`);
};
