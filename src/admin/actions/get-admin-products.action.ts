import { butcherApi } from "@/api/butcherApi";
import type { ProductsResponse } from "@/interface/products.response";
import { resolveProductImageUrl } from "@/lib/product-image";

interface Options {
  limit?: number | string;
  offset?: number | string;
  minPrice?: number;
  maxPrice?: number;
  query?: string;
  isActive?: boolean;
}

export const getAdminProductsAction = async (
  options: Options,
): Promise<ProductsResponse> => {
  const { limit, offset, minPrice, maxPrice, query, isActive } = options;
  const { data } = await butcherApi.get<ProductsResponse>("/products/admin", {
    params: {
      limit,
      offset,
      minPrice,
      maxPrice,
      q: query,
      isActive,
    },
  });

  const productsWithImageUrls = data.products.map((product) => ({
    ...product,
    images: product.images.map(resolveProductImageUrl),
  }));

  return {
    ...data,
    products: productsWithImageUrls,
  };
};
