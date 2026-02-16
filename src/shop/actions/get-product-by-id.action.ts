import { butcherApi } from "@/api/butcherApi"
import type { Product } from "@/interface/product.interface"
import { resolveProductImageUrl } from "@/lib/product-image";

export const getProductByIdAction = async (
  id: string,
  authenticated = false,
): Promise<Product> => {
  if (!id) throw new Error("ID del producto es requerido")

  const endpoint = authenticated ? `/products/shop/${id}` : `/products/${id}`;
  const { data } = await butcherApi.get<Product>(endpoint)

  const images = data.images.map(resolveProductImageUrl)

  return {
    ...data,
    images,
  }
}
