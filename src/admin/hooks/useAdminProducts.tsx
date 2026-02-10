import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { getAdminProductsAction } from "../actions/get-admin-products.action";

export const useAdminProducts = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const limit = searchParams.get("limit") || 9;
  const page = searchParams.get("page") || 1;
  const status = searchParams.get("status") || "all";
  const offset = (Number(page) - 1) * Number(limit);

  const price = searchParams.get("price") || "any";
  let minPrice = undefined;
  let maxPrice = undefined;
  switch (price) {
    case "any":
      break;
    case "0-50":
      minPrice = 0;
      maxPrice = 50;
      break;
    case "51-100":
      minPrice = 51;
      maxPrice = 100;
      break;
    case "101-200":
      minPrice = 101;
      maxPrice = 200;
      break;
    case "200+":
      minPrice = 200;
      maxPrice = undefined;
      break;
  }

  let isActive: boolean | undefined = undefined;
  if (status === "active") isActive = true;
  if (status === "inactive") isActive = false;

  return useQuery({
    queryKey: [
      "admin-products",
      { limit, offset, minPrice, maxPrice, query, status },
    ],
    queryFn: () =>
      getAdminProductsAction({
        limit: isNaN(+limit) ? 9 : limit,
        offset: isNaN(offset) ? 0 : offset,
        minPrice,
        maxPrice,
        query,
        isActive,
      }),
    staleTime: 1000 * 60 * 5,
  });
};
