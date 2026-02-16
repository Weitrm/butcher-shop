import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/auth/store/auth.store";

import { getProductByIdAction } from "../actions/get-product-by-id.action";

export const useProduct = (id: string) => {
  const authStatus = useAuthStore((state) => state.authStatus);
  const isAuthenticated = authStatus === "authenticated";

  return useQuery({
    queryKey: ["product", { id, isAuthenticated }],
    queryFn: () => getProductByIdAction(id, isAuthenticated),
    enabled: Boolean(id),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};
