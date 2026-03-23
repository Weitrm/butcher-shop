import { useMemo, useState } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Package, Trash } from "lucide-react";

import { useAuthStore } from "@/auth/store/auth.store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { Order } from "@/interface/order.interface";
import {
  formatOrderDisplayedPrice,
  formatOrderItemDetail,
  formatOrderUnitsSummary,
  getOrderUnits,
  getUnitLabel,
} from "@/lib/order-unit";
import { currencyFormatter } from "@/lib/currency-formatter";
import {
  formatWeeklyOrdersLabel,
  getEffectiveWeeklyOrderLimit,
  getStartOfWeekSunday,
} from "@/lib/weekly-order-limit";
import { hasSuperUserRole } from "@/lib/user-roles";
import { createOrderAction } from "@/shop/actions/create-order.action";
import { CustomJumbotron } from "@/shop/components/CustomJumbotron";
import { useOrders } from "@/shop/hooks/useOrders";
import { useCartStore } from "@/shop/store/cart.store";

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  completed: "Completado",
  cancelled: "Cancelado",
};

const statusStyles: Record<string, string> = {
  pending: "border-amber-200 bg-amber-100 text-amber-800",
  completed: "border-emerald-200 bg-emerald-100 text-emerald-800",
  cancelled: "border-rose-200 bg-rose-100 text-rose-800",
};

const SUPER_MAX_KG = 9999;

const formatDate = (value: string) =>
  new Date(value).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const LatestOrderCard = ({ order }: { order: Order }) => (
  <Card>
    <CardContent className="p-6 space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Ultimo pedido</h2>
          <p className="text-sm text-muted-foreground">#{order.id.slice(0, 8)}</p>
          <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
            statusStyles[order.status] || "border-slate-200 bg-slate-100 text-slate-700"
          }`}
        >
          {statusLabels[order.status] || order.status}
        </span>
      </div>

      <Separator />

      <div className="space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
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
                <p className="text-muted-foreground" translate="no">
                  {formatOrderItemDetail(item.kg, item.unitPrice, item.isBox)}
                </p>
              </div>
            </div>
            <span className="font-medium">
              {item.isBox ? "No disponible" : <span translate="no">{currencyFormatter(item.subtotal)}</span>}
            </span>
          </div>
        ))}
      </div>

      <Separator />

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Total</span>
        <span className="font-semibold" translate="no">
          {formatOrderDisplayedPrice(order.totalPrice, order.items)}{" "}
          ({formatOrderUnitsSummary(order.items, order.totalKg)})
        </span>
      </div>
    </CardContent>
  </Card>
);

export const OrderPage = () => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const items = useCartStore((state) => state.items);
  const maxTotalKg = useCartStore((state) => state.maxTotalKg);
  const maxItems = useCartStore((state) => state.maxItems);
  const totalPrice = useCartStore((state) => state.getTotalPrice());
  const updateItemKg = useCartStore((state) => state.updateItemKg);
  const updateItemIsBox = useCartStore((state) => state.updateItemIsBox);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);

  const user = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.authStatus);
  const isOrderingDisabled =
    authStatus === "authenticated" && !!user && user.isActive === false;
  const isSuperUser = hasSuperUserRole(user);

  const startOfWeek = useMemo(() => getStartOfWeekSunday(), []);
  const startOfWeekDate = useMemo(() => startOfWeek.toISOString().slice(0, 10), [startOfWeek]);
  const effectiveWeeklyOrderLimit = useMemo(() => getEffectiveWeeklyOrderLimit(user), [user]);
  const { data: latestOrderData, isLoading: isLatestOrderLoading } = useOrders({
    limit: 1,
    useSearchParams: false,
  });
  const {
    data: weeklyOrdersData,
    isLoading: isWeeklyOrdersLoading,
    isError: isWeeklyOrdersError,
  } = useOrders({
    limit: 1,
    useSearchParams: false,
    fromDate: startOfWeekDate,
    enabled: authStatus === "authenticated" && !isSuperUser && effectiveWeeklyOrderLimit !== null,
    retry: false,
  });

  const latestOrder = latestOrderData?.orders[0];
  const ordersThisWeek = isSuperUser ? 0 : weeklyOrdersData?.count || 0;
  const cannotValidateWeeklyLimit =
    !isSuperUser && effectiveWeeklyOrderLimit !== null && isWeeklyOrdersError;
  const hasReachedWeeklyOrderLimit =
    !isSuperUser &&
    effectiveWeeklyOrderLimit !== null &&
    !cannotValidateWeeklyLimit &&
    !isWeeklyOrdersLoading &&
    ordersThisWeek >= effectiveWeeklyOrderLimit;
  const remainingOrdersThisWeek =
    effectiveWeeklyOrderLimit === null
      ? null
      : Math.max(0, effectiveWeeklyOrderLimit - ordersThisWeek);
  const weeklyLimitDescription = useMemo(() => {
    if (isSuperUser) return "Modo super usuario: sin limites de kg ni frecuencia.";
    if (effectiveWeeklyOrderLimit === null) return "Frecuencia semanal: sin limite.";
    if (isWeeklyOrdersLoading) return "Validando disponibilidad semanal...";
    return `Frecuencia semanal: ${formatWeeklyOrdersLabel(effectiveWeeklyOrderLimit)}. Te quedan ${formatWeeklyOrdersLabel(remainingOrdersThisWeek || 0)} esta semana.`;
  }, [
    effectiveWeeklyOrderLimit,
    isSuperUser,
    isWeeklyOrdersLoading,
    remainingOrdersThisWeek,
  ]);

  const orderUnits = useMemo(() => getOrderUnits(items), [items]);

  const handleConfirm = async () => {
    if (isOrderingDisabled || !items.length) return;
    if (cannotValidateWeeklyLimit) {
      toast.error("No se pudo validar tu limite semanal. Recarga la pagina.");
      return;
    }
    if (!isSuperUser && hasReachedWeeklyOrderLimit) {
      const limitLabel =
        effectiveWeeklyOrderLimit === null
          ? "el limite semanal"
          : formatWeeklyOrdersLabel(effectiveWeeklyOrderLimit);
      toast.error(`Ya alcanzaste ${limitLabel}.`);
      return;
    }

    setIsSubmitting(true);

    try {
      await createOrderAction(
        items.map((item) => ({
          productId: item.productId,
          kg: item.kg,
          isBox: item.isBox,
        })),
      );
      clear();
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Pedido confirmado");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        const normalizedMessage = Array.isArray(message) ? message.join(", ") : message;
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
                  Tu cuenta esta deshabilitada para hacer pedidos. Comunicate con un supervisor.
                </div>
              </CardContent>
            </Card>
          )}

          {!isSuperUser && hasReachedWeeklyOrderLimit && (
            <Card className="border-blue-200 bg-blue-50 text-blue-900">
              <CardContent className="flex items-start gap-2 p-4 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4" />
                <div>
                  Alcanzaste el limite semanal de{" "}
                  {effectiveWeeklyOrderLimit === null
                    ? "pedidos"
                    : formatWeeklyOrdersLabel(effectiveWeeklyOrderLimit)}
                  . Si un supervisor te habilita un extra, se reflejara aqui.
                </div>
              </CardContent>
            </Card>
          )}

          {cannotValidateWeeklyLimit && (
            <Card className="border-rose-200 bg-rose-50 text-rose-900">
              <CardContent className="flex items-start gap-2 p-4 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4" />
                <div>
                  No se pudo validar tu limite semanal. Recarga la pagina antes de confirmar.
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
                        {isSuperUser
                          ? weeklyLimitDescription
                          : `Limites de sector: ${maxTotalKg ? `${maxTotalKg} kg` : "sin limite de kg"} y ${maxItems ? `${maxItems} productos` : "sin limite de productos"}. ${weeklyLimitDescription}`}
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
                    {items.map((item) => {
                      const itemLimit = isSuperUser
                        ? SUPER_MAX_KG
                        : Math.max(1, item.maxKgPerOrder || 1);

                      return (
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
                                {item.isBox ? "Precio no disponible para cajas" : <span translate="no">{currencyFormatter(item.price)} / kg</span>}
                              </p>
                              {!isSuperUser && (
                                <p className="text-xs text-muted-foreground">
                                  Maximo {itemLimit} {item.isBox ? "cajas" : "kg"}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {item.allowBoxes && (
                              <Button
                                type="button"
                                variant={item.isBox ? "default" : "outline"}
                                size="sm"
                                disabled={isOrderingDisabled}
                                onClick={() => {
                                  const result = updateItemIsBox(item.productId, !item.isBox);
                                  if (!result.ok) {
                                    toast.error(result.error || "No se pudo cambiar el tipo");
                                  }
                                }}
                              >
                                <Package className="h-4 w-4" />
                                {item.isBox ? "Caja" : "Kg"}
                              </Button>
                            )}
                            <Input
                              type="number"
                              min={1}
                              max={itemLimit}
                              step={1}
                              value={item.kg}
                              onChange={(event) => {
                                const value = event.target.value;
                                if (value === "") return;
                                const parsed = Number(value);
                                if (Number.isNaN(parsed)) return;
                                const result = updateItemKg(
                                  item.productId,
                                  Math.max(1, Math.min(itemLimit, Math.floor(parsed))),
                                  { ignoreLimits: isSuperUser },
                                );
                                if (!result.ok) {
                                  toast.error(
                                    result.error || "No se pudo actualizar la cantidad",
                                  );
                                }
                              }}
                              className="h-9 w-24"
                              aria-label={`${item.isBox ? "Cajas" : "Kg"} para ${item.name}`}
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
                      );
                    })}
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-2 text-sm">
                    {orderUnits.totalKg > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Total kg</span>
                        <span className="font-semibold">{orderUnits.totalKg} kg</span>
                      </div>
                    )}
                    {orderUnits.totalBoxes > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Total cajas</span>
                        <span className="font-semibold">
                          {orderUnits.totalBoxes} {getUnitLabel(true, orderUnits.totalBoxes)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-semibold" translate="no">
                        {formatOrderDisplayedPrice(totalPrice, items)}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    Los kg y el precio mostrados son estimados. Pueden variar al momento de
                    preparar el pedido.
                  </div>

                  <Button
                    onClick={handleConfirm}
                    disabled={
                      isSubmitting ||
                      isOrderingDisabled ||
                      cannotValidateWeeklyLimit ||
                      (!isSuperUser &&
                        (hasReachedWeeklyOrderLimit ||
                          (effectiveWeeklyOrderLimit !== null && isWeeklyOrdersLoading)))
                    }
                  >
                    Confirmar pedido
                  </Button>
                </CardContent>
              </Card>

              {isLatestOrderLoading ? (
                <p className="text-sm text-muted-foreground">Cargando pedidos...</p>
              ) : latestOrder ? (
                <LatestOrderCard order={latestOrder} />
              ) : null}
            </>
          ) : isLatestOrderLoading ? (
            <p className="text-sm text-muted-foreground">Cargando pedidos...</p>
          ) : latestOrder ? (
            <LatestOrderCard order={latestOrder} />
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
