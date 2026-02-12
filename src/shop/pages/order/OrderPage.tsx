import { useState } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Trash } from "lucide-react";

import { CustomJumbotron } from "@/shop/components/CustomJumbotron";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { createOrderAction } from "@/shop/actions/create-order.action";
import { useOrders } from "@/shop/hooks/useOrders";
import { useCartStore } from "@/shop/store/cart.store";
import { useAuthStore } from "@/auth/store/auth.store";

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  completed: "Completado",
  cancelled: "Cancelado",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export const OrderPage = () => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const items = useCartStore((state) => state.items);
  const totalKg = useCartStore((state) => state.getTotalKg());
  const totalPrice = useCartStore((state) => state.getTotalPrice());
  const updateItemKg = useCartStore((state) => state.updateItemKg);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);
  const user = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.authStatus);
  const isOrderingDisabled = authStatus === "authenticated" && user && !user.isActive;

  const { data, isLoading: isOrdersLoading } = useOrders({
    limit: 1,
    useSearchParams: false,
  });
  const latestOrder = data?.orders[0];

  const handleConfirm = async () => {
    if (isOrderingDisabled) return;
    if (!items.length) return;
    setIsSubmitting(true);

    try {
      await createOrderAction(
        items.map((item) => ({ productId: item.productId, kg: item.kg })),
      );
      clear();
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Pedido confirmado");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        const normalizedMessage = Array.isArray(message)
          ? message.join(", ")
          : message;
        toast.error(normalizedMessage || "No se pudo confirmar el pedido");
        return;
      }
      toast.error("No se pudo confirmar el pedido");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CustomJumbotron
        title="Pedido actual"
        subTitle="Controla tus productos antes de confirmar"
      />

      <section className="py-10 px-4 lg:px-8">
        <div className="container mx-auto max-w-3xl space-y-6">
          {isOrderingDisabled && (
            <Card className="border-amber-200 bg-amber-50 text-amber-900">
              <CardContent className="flex items-start gap-2 p-4 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4" />
                <div>
                  Tu cuenta esta deshabilitada para hacer pedidos. Comunicate con
                  un supervisor.
                </div>
              </CardContent>
            </Card>
          )}
          {items.length > 0 ? (
            <>
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">Tu pedido</h2>
                      <p className="text-sm text-muted-foreground">
                        Máximo 10 kg y 2 productos distintos.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clear}
                      disabled={isSubmitting || isOrderingDisabled}
                    >
                      Limpiar
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-16 w-16 rounded-md object-cover"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-md bg-muted/40" />
                          )}
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ${item.price} / kg
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            step={1}
                            value={item.kg}
                            onChange={(event) => {
                              const value = event.target.value;
                              if (value === "") return;
                              const parsed = Number(value);
                              if (Number.isNaN(parsed)) return;
                              const result = updateItemKg(
                                item.productId,
                                Math.max(1, Math.min(10, Math.floor(parsed))),
                              );
                              if (!result.ok) {
                                toast.error(
                                  result.error || "No se pudo actualizar el kg",
                                );
                              }
                            }}
                            className="h-9 w-24"
                            aria-label={`Kg para ${item.name}`}
                            disabled={isOrderingDisabled}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeItem(item.productId)}
                            disabled={isSubmitting || isOrderingDisabled}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total kg</span>
                      <span className="font-semibold">{totalKg} kg</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-semibold">${totalPrice}</span>
                    </div>
                  </div>

                  <Button onClick={handleConfirm} disabled={isSubmitting || isOrderingDisabled}>
                    Confirmar pedido
                  </Button>
                </CardContent>
              </Card>

              {isOrdersLoading ? (
                <p className="text-sm text-muted-foreground">
                  Cargando pedidos...
                </p>
              ) : latestOrder ? (
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-lg font-semibold">Último pedido</h2>
                        <p className="text-sm text-muted-foreground">
                          #{latestOrder.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(latestOrder.createdAt)}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        {statusLabels[latestOrder.status] || latestOrder.status}
                      </span>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      {latestOrder.items.map((item) => (
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
                        ${latestOrder.totalPrice} ({latestOrder.totalKg} kg)
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </>
          ) : isOrdersLoading ? (
            <p className="text-sm text-muted-foreground">
              Cargando pedidos...
            </p>
          ) : latestOrder ? (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Último pedido</h2>
                    <p className="text-sm text-muted-foreground">
                      #{latestOrder.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(latestOrder.createdAt)}
                    </p>
                  </div>
                  <span className="text-sm font-medium">
                    {statusLabels[latestOrder.status] || latestOrder.status}
                  </span>
                </div>

                <Separator />

                <div className="space-y-3">
                  {latestOrder.items.map((item) => (
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
                    ${latestOrder.totalPrice} ({latestOrder.totalKg} kg)
                  </span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                No tienes un pedido activo. Agrega productos desde el catalogo.
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </>
  );
};
