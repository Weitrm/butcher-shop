import { butcherApi } from "@/api/butcherApi"
import type { Product } from "@/interface/product.interface"
import { resolveProductImageUrl } from "@/lib/product-image";

export const getProductByIdAction = async (id: string): Promise<Product> => {
  if (!id) throw new Error("ID del producto es requerido")

  const { data } = await butcherApi.get<Product>(`/products/${id}`)

  const images = data.images.map(resolveProductImageUrl)

  return {
    ...data,
    images,
  }
}
