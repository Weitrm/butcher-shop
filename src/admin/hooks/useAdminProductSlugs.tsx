import { useQuery } from "@tanstack/react-query";

import { getAdminProductSlugsAction } from "../actions/get-admin-product-slugs.action";

export const useAdminProductSlugs = () =>
  useQuery({
    queryKey: ["admin-product-slugs"],
    queryFn: getAdminProductSlugsAction,
    staleTime: 1000 * 60 * 5,
  });

