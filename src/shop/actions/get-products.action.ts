import { butcherApi } from "@/api/butcherApi"
import type { ProductsResponse } from "@/interface/products.response";
import { resolveProductImageUrl } from "@/lib/product-image";


interface Options {
    limit?: number | string;
    offset?: number | string;
    query?: string;
    authenticated?: boolean;
}

export const getProductsAction = async(options: Options): Promise<ProductsResponse> => {
    
    const {limit, offset, query, authenticated} = options;
    const endpoint = authenticated ? '/products/shop' : '/products';
    const  {data} = await butcherApi.get<ProductsResponse>(endpoint, {
        params: {
            limit,
            offset,
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
