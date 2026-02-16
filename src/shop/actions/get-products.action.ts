import { butcherApi } from "@/api/butcherApi"
import type { ProductsResponse } from "@/interface/products.response";
import { resolveProductImageUrl } from "@/lib/product-image";


interface Options {
    limit?: number | string;
    offset?: number | string;
    minPrice?: number;
    maxPrice?: number;
    query?: string;
    authenticated?: boolean;
}

export const getProductsAction = async(options: Options): Promise<ProductsResponse> => {
    
    const {limit, offset, minPrice, maxPrice, query, authenticated} = options;
    const endpoint = authenticated ? '/products/shop' : '/products';
    const  {data} = await butcherApi.get<ProductsResponse>(endpoint, {
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
        images: product.images.map(resolveProductImageUrl)
    }))


    return {
        ...data,
        products: productsWithImageUrls
    };
}       
