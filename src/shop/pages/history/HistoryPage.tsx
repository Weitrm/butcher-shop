import { CustomPagination } from "@/components/custom/CustomPagination"
import { CustomJumbotron } from "@/shop/components/CustomJumbotron"

export const HistoryPage = () => {
  return (
    <>
        <CustomJumbotron title='Historial de pedidos' subTitle='Consulta tus pedidos anteriores'/>

        <CustomPagination totalPages={5} />
    </>
  )
}
