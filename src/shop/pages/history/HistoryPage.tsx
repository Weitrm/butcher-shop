import { CustomJumbotron } from "@/shop/components/CustomJumbotron"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useOrders } from "@/shop/hooks/useOrders"

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  completed: "Completado",
  cancelled: "Cancelado",
}

const formatDate = (value: string) =>
  new Date(value).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  })

export const HistoryPage = () => {
  const { data: orders = [], isLoading } = useOrders()

  return (
    <>
        <CustomJumbotron title='Historial de pedidos' subTitle='Consulta tus pedidos anteriores'/>

        <section className="py-10 px-4 lg:px-8">
          <div className="container mx-auto max-w-4xl space-y-6">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Cargando pedidos...</p>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-sm text-muted-foreground">
                  Todavia no tienes pedidos registrados.
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-lg font-semibold">
                          Pedido #{order.id.slice(0, 8)}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-3">
                            {item.product.images[0] ? (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.title}
                                className="h-12 w-12 rounded-md object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-md bg-muted/40" />
                            )}
                            <div>
                              <p className="font-medium">{item.product.title}</p>
                              <p className="text-muted-foreground">
                                {item.kg} kg x ${item.unitPrice}
                              </p>
                            </div>
                          </div>
                          <span className="font-medium">${item.subtotal}</span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-semibold">
                        ${order.totalPrice} ({order.totalKg} kg)
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
    </>
  )
}
