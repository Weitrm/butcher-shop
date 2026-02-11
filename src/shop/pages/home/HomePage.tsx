import { CustomPagination } from "@/components/custom/CustomPagination"
import { CustomJumbotron } from "@/shop/components/CustomJumbotron"
import { ProductsGrid } from "@/shop/components/ProductsGrid"
import { useProducts } from "@/shop/hooks/useProducts"


export const HomePage = () => {


  const {data} = useProducts();

  return (
    <>
      <CustomJumbotron title='Bienvenido a CARNICERIA FMP'/>

      <ProductsGrid products={data?.products || []}/>

      <CustomPagination totalPages={data?.pages || 0} />
    </>
  )
}
