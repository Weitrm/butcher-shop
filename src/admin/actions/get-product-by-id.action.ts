import { butcherApi } from "@/api/butcherApi";
import type { Product } from "@/interface/product.interface"
import { resolveProductImageUrl } from "@/lib/product-image";

export const getProductByIdAction = async(id: string): Promise<Product> => {
  

    if (!id) throw new Error('ID del producto es requerido');

    if  (id === 'new') {
        return {
            id: 'new',
            title: '',
            price: 0,
            description: '',
            slug: '',
            stock: 0,
            isActive: true,
            images: [],
        } as unknown as Product;
    }

    const {data} = await butcherApi.get<Product>(`/products/admin/${id}`);

    const images = data.images.map(resolveProductImageUrl)

    return {
        ...data,
        images
    };
};
