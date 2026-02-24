import { useMemo } from "react";

import { CustomPagination } from "@/components/custom/CustomPagination";
import { CustomJumbotron } from "@/shop/components/CustomJumbotron";
import { ProductsGrid } from "@/shop/components/ProductsGrid";
import { useProducts } from "@/shop/hooks/useProducts";

export const HomePage = () => {
  const { data } = useProducts();

  const orderedProducts = useMemo(() => {
    return data?.products || [];
  }, [data?.products]);

  return (
    <>
      <CustomJumbotron title="Bienvenido a CARNICERIA FMP" />

      <ProductsGrid products={orderedProducts} />

      <CustomPagination totalPages={data?.pages || 0} />
    </>
  );
};
