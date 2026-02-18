import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { CalendarDays, Search, X } from "lucide-react";

import { AdminTitle } from "@/admin/components/AdminTitle";
import { useAdminOrders } from "@/admin/hooks/useAdminOrders";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { CustomPagination } from "@/components/custom/CustomPagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { currencyFormatter } from "@/lib/currency-formatter";
import {
  formatOrderItemSummary,
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

export const AdminOrdersHistoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialUser = searchParams.get("user") || "";
  const initialProduct = searchParams.get("product") || "";
  const initialFromDate = searchParams.get("fromDate") || "";
  const initialToDate = searchParams.get("toDate") || "";
  const [userQuery, setUserQuery] = useState(initialUser);
  const [productQuery, setProductQuery] = useState(initialProduct);
  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);
  const { data, isLoading } = useAdminOrders({ scope: "history" });
  const orders = useMemo(() => data?.orders || [], [data?.orders]);
  const isInvalidDateRange = Boolean(fromDate && toDate && fromDate > toDate);
  const hasActiveFilters = Boolean(
    searchParams.get("user") ||
      searchParams.get("product") ||
      searchParams.get("fromDate") ||
      searchParams.get("toDate"),
  );

  const summary = useMemo(
    () =>
      orders.reduce(
        (acc, order) => {
          const units = getOrderUnits(order.items);
          acc.total += 1;
          acc.totalKg += units.totalKg;
          acc.totalBoxes += units.totalBoxes;
          acc.totalPrice += order.totalPrice;
          if (!isOrderPriceAvailable(order.items)) acc.hasBoxOrders = true;
          if (order.status === "completed") acc.completed += 1;
          return acc;
        },
        {
          total: 0,
          totalKg: 0,
          totalBoxes: 0,
          totalPrice: 0,
          completed: 0,
          hasBoxOrders: false,
        },
      ),
    [orders],
  );

  const handleSearch = () => {
    if (isInvalidDateRange) return;

    const nextParams = new URLSearchParams(searchParams);
    if (userQuery.trim()) {
      nextParams.set("user", userQuery.trim());
    } else {
      nextParams.delete("user");
    }
    if (productQuery.trim()) {
      nextParams.set("product", productQuery.trim());
    } else {
      nextParams.delete("product");
    }
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

  const handleClear = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("user");
    nextParams.delete("product");
    nextParams.delete("fromDate");
    nextParams.delete("toDate");
    nextParams.set("page", "1");
    setSearchParams(nextParams);
    setUserQuery("");
    setProductQuery("");
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

  if (isLoading) {
    return <CustomFullScreenLoading />;
  }

  return (
    <>
      <AdminTitle title="Historial" subtitle="Pedidos anteriores a la semana con filtros avanzados" />

      <Card className="mb-6 border-slate-200 shadow-sm">
        <CardContent className="space-y-4 bg-gradient-to-r from-white via-slate-50 to-white p-6">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Buscar por cliente
              </label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={userQuery}
                  onChange={(event) => setUserQuery(event.target.value)}
                  placeholder="Nombre, funcionario o cedula"
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Buscar por producto
              </label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={productQuery}
                  onChange={(event) => setProductQuery(event.target.value)}
                  placeholder="Nombre o slug"
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Desde
              </label>
              <div className="relative mt-2">
                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Hasta
              </label>
              <div className="relative mt-2">
                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSearch} disabled={isInvalidDateRange}>
              Buscar
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickRange(30)}>
              Ultimos 30 dias
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickRange(90)}>
              Ultimos 90 dias
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickRange(180)}>
              Ultimos 180 dias
            </Button>
            <Button variant="outline" onClick={handleClear}>
              <X className="h-4 w-4" />
              Limpiar
            </Button>
          </div>

          {isInvalidDateRange ? (
            <p className="text-xs font-medium text-rose-600">
              La fecha inicial no puede ser mayor que la fecha final.
            </p>
          ) : null}

          {hasActiveFilters ? (
            <p className="text-xs text-slate-500">
              Filtros activos aplicados sobre el historial.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Pedidos</p>
            <p className="text-2xl font-semibold text-slate-900">{summary.total}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Unidades</p>
            <p className="text-xl font-semibold text-slate-900">
              {summary.totalKg} kg / {summary.totalBoxes} cajas
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total vendido</p>
            <p className="text-xl font-semibold text-slate-900">
              {summary.hasBoxOrders
                ? "Precio no disponible (incluye cajas)"
                : currencyFormatter(summary.totalPrice)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Completados</p>
            <p className="text-2xl font-semibold text-slate-900">{summary.completed}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <Table className="bg-white">
            <TableHeader className="bg-slate-50/70">
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Detalle</TableHead>
                <TableHead>Unidades</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-gray-500">
                    {hasActiveFilters
                      ? "No hay pedidos para el filtro seleccionado."
                      : "No hay pedidos en el historial."}
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {order.user?.fullName || "Sin nombre"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {order.user
                            ? [
                                order.user.employeeNumber
                                  ? `Func. ${order.user.employeeNumber}`
                                  : null,
                                order.user.nationalId
                                  ? `CI ${order.user.nationalId}`
                                  : null,
                              ]
                                .filter(Boolean)
                                .join(" , ") || "-"
                            : "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[260px] truncate text-sm text-gray-600">
                        {order.items
                          .map((item) =>
                            formatOrderItemSummary(item.product.title, item.kg, item.isBox),
                          )
                          .join(", ")}
                      </div>
                    </TableCell>
                    <TableCell>{formatOrderUnitsSummary(order.items, order.totalKg)}</TableCell>
                    <TableCell>
                      {isOrderPriceAvailable(order.items)
                        ? currencyFormatter(order.totalPrice)
                        : "Precio no disponible"}
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          statusStyles[order.status] ||
                          "border-slate-200 bg-slate-100 text-slate-700"
                        }`}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-2">
        <CustomPagination totalPages={data?.pages || 0} />
      </div>
    </>
  );
};
