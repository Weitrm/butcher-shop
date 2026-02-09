import { butcherApi } from "@/api/butcherApi";
import type { Product } from "@/interface/product.interface";

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
        .map(image => {
            if (image.includes('http')) return image.split('/').pop() || '';
            return image;
        })
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
        images: data.images.map(image => {
            if (image.includes('http')) return image;
            return `${import.meta.env.VITE_API_URL}/files/product/${image}`;
        })
    };
};
