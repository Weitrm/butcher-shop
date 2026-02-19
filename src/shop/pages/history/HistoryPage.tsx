import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { CalendarDays, X } from "lucide-react";

import { useOrders } from "@/shop/hooks/useOrders";
import { CustomJumbotron } from "@/shop/components/CustomJumbotron";
import { CustomPagination } from "@/components/custom/CustomPagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { currencyFormatter } from "@/lib/currency-formatter";
import {
  formatOrderItemDetail,
  formatOrderUnitsSummary,
  getOrderUnits,
  isOrderPriceAvailable,
} from "@/lib/order-unit";

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

const statusAccentStyles: Record<string, string> = {
  pending: "border-l-amber-400",
  completed: "border-l-emerald-400",
  cancelled: "border-l-rose-400",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const HistoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFromDate = searchParams.get("fromDate") || "";
  const initialToDate = searchParams.get("toDate") || "";
  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);
  const { data, isLoading } = useOrders();
  const orders = useMemo(() => data?.orders || [], [data?.orders]);
  const orderedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [orders],
  );
  const isInvalidDateRange = Boolean(fromDate && toDate && fromDate > toDate);
  const hasActiveDateFilters = Boolean(
    searchParams.get("fromDate") || searchParams.get("toDate"),
  );

  const summary = useMemo(
    () =>
      orderedOrders.reduce(
        (acc, order) => {
          const units = getOrderUnits(order.items);
          acc.total += 1;
          acc.totalKg += units.totalKg;
          acc.totalBoxes += units.totalBoxes;
          acc.totalPrice += order.totalPrice;
          if (!isOrderPriceAvailable(order.items)) acc.hasBoxOrders = true;
          if (order.status === "pending") acc.pending += 1;
          return acc;
        },
        {
          total: 0,
          totalKg: 0,
          totalBoxes: 0,
          totalPrice: 0,
          pending: 0,
          hasBoxOrders: false,
        },
      ),
    [orderedOrders],
  );

  const handleApplyDateFilters = () => {
    if (isInvalidDateRange) return;

    const nextParams = new URLSearchParams(searchParams);
    if (fromDate) {
      nextParams.set("fromDate", fromDate);
    } else {
      nextParams.delete("fromDate");
    }
    if (toDate) {
      nextParams.set("toDate", toDate);
    } else {
      nextParams.delete("toDate");
    }
    nextParams.set("page", "1");
    setSearchParams(nextParams);
  };

  const handleClearDateFilters = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("fromDate");
    nextParams.delete("toDate");
    nextParams.set("page", "1");
    setSearchParams(nextParams);
    setFromDate("");
    setToDate("");
  };

  const handleQuickRange = (days: number) => {
    const now = new Date();
    const to = toDateInputValue(now);
    const fromValue = new Date(now);
    fromValue.setDate(fromValue.getDate() - (days - 1));
    const from = toDateInputValue(fromValue);

    setFromDate(from);
    setToDate(to);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("fromDate", from);
    nextParams.set("toDate", to);
    nextParams.set("page", "1");
    setSearchParams(nextParams);
  };

  return (
    <>
      <CustomJumbotron title="Historial de pedidos" subTitle="Consulta tus pedidos anteriores" />

      <section className="px-4 py-10 lg:px-8">
        <div className="container mx-auto max-w-5xl space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="space-y-4 bg-gradient-to-r from-white via-slate-50 to-white p-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Desde</label>
                  <div className="relative mt-2">
                    <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="date"
                      value={fromDate}
                      onChange={(event) => setFromDate(event.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Hasta</label>
                  <div className="relative mt-2">
                    <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="date"
                      value={toDate}
                      onChange={(event) => setToDate(event.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="flex items-end gap-2 sm:col-span-2">
                  <Button onClick={handleApplyDateFilters} disabled={isInvalidDateRange}>
                    Aplicar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleQuickRange(7)}>
                    7 dias
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleQuickRange(30)}>
                    30 dias
                  </Button>
                  <Button variant="outline" onClick={handleClearDateFilters}>
                    <X className="h-4 w-4" />
                    Limpiar
                  </Button>
                </div>
              </div>

              {isInvalidDateRange ? (
                <p className="text-xs font-medium text-rose-600">
                  La fecha inicial no puede ser mayor que la fecha final.
                </p>
              ) : null}

              {hasActiveDateFilters ? (
                <p className="text-xs text-slate-500">
                  Filtro activo: {fromDate || "..."} a {toDate || "..."}.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Pedidos</p>
                <p className="text-2xl font-semibold text-slate-900">{summary.total}</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Total pedidos
                </p>
                <p className="text-xl font-semibold text-slate-900">
                  {summary.totalKg} kg / {summary.totalBoxes} cajas
                </p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Total gastado</p>
                <p className="text-xl font-semibold text-slate-900">
                  {summary.hasBoxOrders
                    ? "Precio no disponible (incluye cajas)"
                    : currencyFormatter(summary.totalPrice)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Pendientes</p>
                <p className="text-2xl font-semibold text-slate-900">{summary.pending}</p>
              </CardContent>
            </Card>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando pedidos...</p>
          ) : orderedOrders.length === 0 ? (
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                {hasActiveDateFilters
                  ? "No hay pedidos para el rango de fechas seleccionado."
                  : "Todavia no tienes pedidos registrados."}
              </CardContent>
            </Card>
          ) : (
            orderedOrders.map((order) => (
              <Card
                key={order.id}
                className={`border-l-4 border-slate-200 shadow-sm transition-shadow hover:shadow-md ${
                  statusAccentStyles[order.status] || "border-l-slate-300"
                }`}
              >
                <CardContent className="space-y-4 p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">
                        Pedido #{order.id.slice(0, 8)}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        statusStyles[order.status] ||
                        "border-slate-200 bg-slate-100 text-slate-700"
                      }`}
                    >
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
                              className="h-12 w-12 rounded-md object-cover ring-1 ring-slate-200"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-md bg-muted/40" />
                          )}
                          <div>
                            <p className="font-medium">{item.product.title}</p>
                            <p className="text-muted-foreground">
                              {formatOrderItemDetail(item.kg, item.unitPrice, item.isBox)}
                            </p>
                          </div>
                        </div>
                        <span className="font-medium">
                          {item.isBox ? "No disponible" : `$${item.subtotal}`}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-semibold">
                      {isOrderPriceAvailable(order.items)
                        ? `$${order.totalPrice}`
                        : "Precio no disponible (incluye cajas)"}{" "}
                      ({formatOrderUnitsSummary(order.items, order.totalKg)})
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          <CustomPagination totalPages={data?.pages || 0} />
        </div>
      </section>
    </>
  );
};
