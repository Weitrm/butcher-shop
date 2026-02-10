import { useQuery } from "@tanstack/react-query"
import { getProductByIdAction } from "../actions/get-product-by-id.action"

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", { id }],
    queryFn: () => getProductByIdAction(id),
    enabled: Boolean(id),
    retry: false,
    staleTime: 1000 * 60 * 5,
  })
}
