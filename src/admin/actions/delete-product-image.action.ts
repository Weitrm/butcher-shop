import { butcherApi } from "@/api/butcherApi";
import type { Product } from "@/interface/product.interface";
import {
    normalizeProductImageForSave,
    resolveProductImageUrl,
} from "@/lib/product-image";

interface DeleteProductImageArgs {
    productId: string;
    imageUrl: string;
    images: string[];
}


export const deleteProductImageAction = async (
    { productId, imageUrl, images }: DeleteProductImageArgs
): Promise<Product> => {
    if (!productId) throw new Error('ID del producto es requerido');

    const imagesToDelete = images
        .filter(image => image !== imageUrl)
        .map(normalizeProductImageForSave)
        .filter(Boolean);

    const { data } = await butcherApi<Product>({
        url: `/products/${productId}`,
        method: 'PATCH',
        data: {
            images: imagesToDelete,
        }
    });

    return {
        ...data,
        images: data.images.map(resolveProductImageUrl)
    };
};
