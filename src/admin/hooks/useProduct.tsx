import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getProductByIdAction } from "../actions/get-product-by-id.action"
import type { Product } from "@/interface/product.interface";
import { createUpdateProductAction } from "../actions/create-update-product.action";
import { deleteProductImageAction } from "../actions/delete-product-image.action";

export const useProduct = (id: string) => {

    const queryClient = useQueryClient();
    
    const query = useQuery({
        queryKey: ['product', {id}],
        queryFn: () => getProductByIdAction(id),
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes,
    })
    
    const mutation = useMutation({
        mutationFn: createUpdateProductAction,
        onSuccess: (product: Product) => {
            // Invalidar cache
            queryClient.invalidateQueries({queryKey: ['products']});
            queryClient.invalidateQueries({queryKey: ['product', {id: product.id}]});

            // Actualizar queryData
            queryClient.setQueryData(['products', {id: product.id}], product);
        }

    })

    const deleteImageMutation = useMutation({
        mutationFn: deleteProductImageAction,
        onSuccess: (product: Product) => {
            // Invalidar cache
            queryClient.invalidateQueries({queryKey: ['products']});
            queryClient.invalidateQueries({queryKey: ['product', {id: product.id}]});

            // Actualizar queryData
            queryClient.setQueryData(['products', {id: product.id}], product);
        }
    })

    return {
        ...query,
        mutation,
        deleteImageMutation,
    }
}
