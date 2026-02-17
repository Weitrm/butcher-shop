import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";

import { useAuthStore } from "@/auth/store/auth.store";

import { getProductsAction } from "../actions/get-products.action";

export const useProducts = () => {
  const [searchParams] = useSearchParams();
  const authStatus = useAuthStore((state) => state.authStatus);
  const isAuthenticated = authStatus === "authenticated";
  const query = searchParams.get("query") || "";
  const limit = searchParams.get("limit") || 9;
  const page = searchParams.get("page") || 1;
  const offset = (Number(page) - 1) * Number(limit);

  return useQuery({
    queryKey: ["products", { limit, offset, query, isAuthenticated }],
    queryFn: () =>
      getProductsAction({
        limit: isNaN(+limit) ? 9 : limit,
        offset: isNaN(offset) ? 0 : offset,
        query,
        authenticated: isAuthenticated,
      }),
    staleTime: 1000 * 60 * 5,
  });
};
