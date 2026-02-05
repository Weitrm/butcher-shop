import { butcherApi } from "@/api/butcherApi";
import type { Product } from "@/interface/product.interface"

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
            images: [],
        } as unknown as Product;
    }

    const {data} = await butcherApi.get<Product>(`/products/${id}`);

    const images = data.images.map(image => { 
        if (image.includes('http')) return image;
        return `${import.meta.env.VITE_API_URL}/files/product/${image}`;  
     })

    return {
        ...data,
        images
    };
};
