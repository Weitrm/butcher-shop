import { butcherApi } from "@/api/butcherApi"
import type { ProductsResponse } from "@/interface/products.response";


interface Options {
    limit?: number | string;
    offset?: number | string;
    minPrice?: number;
    maxPrice?: number;
    query?: string;
}

export const getProductsAction = async(options: Options): Promise<ProductsResponse> => {
    
    const {limit, offset, minPrice, maxPrice, query} = options;
    const  {data} = await butcherApi.get<ProductsResponse>('/products', {
        params: {
            limit,
            offset,
            minPrice,
            maxPrice,
            q: query,
        },
    });

    const productsWithImageUrls = data.products.map(product => ({
        ...product,
        images: product.images.map(image => `${import.meta.env.VITE_API_URL}/files/product/${image}`)
    }))


    return {
        ...data,
        products: productsWithImageUrls
    };
}       