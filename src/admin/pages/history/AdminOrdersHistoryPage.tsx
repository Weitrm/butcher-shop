import { useState, type CSSProperties } from "react";
import { useSearchParams } from "react-router";
import { CalendarDays, Search, X } from "lucide-react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateOrderStatusAction } from "@/admin/actions/update-order-status.action";
import { AdminTitle } from "@/admin/components/AdminTitle";
import { OrderItemsSummaryCell } from "@/admin/components/orders/OrderItemsSummaryCell";
import {
  adminOrderStatusOptionStyles,
  adminOrderStatusOptions,
  adminOrderStatusStyles,
} from "@/admin/components/orders/orderStatusUI";
import { useAdminOrders } from "@/admin/hooks/useAdminOrders";
import { useAdminOrdersHistorySummary } from "@/admin/hooks/useAdminOrdersHistorySummary";
import { useAdminSectors } from "@/admin/hooks/useAdminSectors";
import { SectorBadge } from "@/components/custom/SectorBadge";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { CustomPagination } from "@/components/custom/CustomPagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { OrderStatus } from "@/interface/order.interface";
import { currencyFormatter } from "@/lib/currency-formatter";
import { formatOrderUnitsSummary, isOrderPriceAvailable } from "@/lib/order-unit";
import { getSectorTextColor, normalizeSectorColor } from "@/lib/sector-color";

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

const filterChipStyles = {
  user: "border-slate-200 bg-slate-100 text-slate-700",
  product: "border-blue-200 bg-blue-100 text-blue-800",
  fromDate: "border-amber-200 bg-amber-100 text-amber-800",
  toDate: "border-amber-200 bg-amber-100 text-amber-800",
  sector: "border-violet-200 bg-violet-100 text-violet-800",
  hasBoxes: "border-orange-200 bg-orange-100 text-orange-800",
} as const;

const getStatusFilterChipStyle = (status: string | null) => {
  if (!status || status === "all") {
    return "border-slate-200 bg-slate-100 text-slate-700";
  }

  return (
    adminOrderStatusStyles[status as OrderStatus] ||
    "border-slate-200 bg-slate-100 text-slate-700"
  );
};

const filterChipBaseClassName = "inline-flex items-center rounded-full border px-2.5 py-1 font-medium";

const getFilterChipClassName = (tone: string) =>
  `${filterChipBaseClassName} ${tone}`;

const getSectorFilterChipStyle = (color?: string | null): CSSProperties => {
  const safeColor = normalizeSectorColor(color);

  return {
    backgroundColor: safeColor,
    borderColor: safeColor,
    color: getSectorTextColor(safeColor),
  };
};

export const AdminOrdersHistoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialUser = searchParams.get("user") || "";
  const initialProduct = searchParams.get("product") || "";
  const initialFromDate = searchParams.get("fromDate") || "";
  const initialToDate = searchParams.get("toDate") || "";
  const initialSectorId = searchParams.get("sectorId") || "";
  const initialStatus = searchParams.get("status") || "all";
  const initialHasBoxes = searchParams.get("hasBoxes") === "true";
  const [userQuery, setUserQuery] = useState(initialUser);
  const [productQuery, setProductQuery] = useState(initialProduct);
  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);
  const [sectorId, setSectorId] = useState(initialSectorId);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [hasBoxesOnly, setHasBoxesOnly] = useState(initialHasBoxes);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const { data: sectors = [] } = useAdminSectors();
  const { data, isLoading } = useAdminOrders({ scope: "history" });
  const { data: summaryData, isLoading: isSummaryLoading } = useAdminOrdersHistorySummary({
    scope: "history",
  });
  const queryClient = useQueryClient();
  const statusMutation = useMutation({
    mutationFn: updateOrderStatusAction,
  });
  const orders = data?.orders || [];
  const isInvalidDateRange = Boolean(fromDate && toDate && fromDate > toDate);
  const hasActiveFilters = Boolean(
    searchParams.get("user") ||
      searchParams.get("product") ||
      searchParams.get("fromDate") ||
      searchParams.get("toDate") ||
      searchParams.get("sectorId") ||
      searchParams.get("status") ||
      searchParams.get("hasBoxes"),
  );
  const summary = summaryData || {
    total: 0,
    totalKg: 0,
    totalBoxes: 0,
    totalPrice: 0,
    completed: 0,
    hasBoxOrders: false,
  };
  const selectedSector = sectors.find((sector) => sector.id === sectorId);

  const handleSearch = () => {
    if (isInvalidDateRange) return;

    const nextParams = new URLSearchParams(searchParams);
    if (userQuery.trim()) nextParams.set("user", userQuery.trim());
    else nextParams.delete("user");
    if (productQuery.trim()) nextParams.set("product", productQuery.trim());
    else nextParams.delete("product");
    if (fromDate) nextParams.set("fromDate", fromDate);
    else nextParams.delete("fromDate");
    if (toDate) nextParams.set("toDate", toDate);
    else nextParams.delete("toDate");
    if (sectorId) nextParams.set("sectorId", sectorId);
    else nextParams.delete("sectorId");
    if (statusFilter !== "all") nextParams.set("status", statusFilter);
    else nextParams.delete("status");
    if (hasBoxesOnly) nextParams.set("hasBoxes", "true");
    else nextParams.delete("hasBoxes");
    nextParams.set("page", "1");
    setSearchParams(nextParams);
  };

  const handleClear = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("user");
    nextParams.delete("product");
    nextParams.delete("fromDate");
    nextParams.delete("toDate");
    nextParams.delete("sectorId");
    nextParams.delete("status");
    nextParams.delete("hasBoxes");
    nextParams.set("page", "1");
    setSearchParams(nextParams);
    setUserQuery("");
    setProductQuery("");
    setFromDate("");
    setToDate("");
    setSectorId("");
    setStatusFilter("all");
    setHasBoxesOnly(false);
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
    if (statusFilter !== "all") nextParams.set("status", statusFilter);
    else nextParams.delete("status");
    if (hasBoxesOnly) nextParams.set("hasBoxes", "true");
    else nextParams.delete("hasBoxes");
    nextParams.set("page", "1");
    setSearchParams(nextParams);
  };

  const removeFilter = (filter: "user" | "product" | "fromDate" | "toDate" | "sectorId" | "status" | "hasBoxes") => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete(filter);
    nextParams.set("page", "1");
    setSearchParams(nextParams);

    if (filter === "user") setUserQuery("");
    if (filter === "product") setProductQuery("");
    if (filter === "fromDate") setFromDate("");
    if (filter === "toDate") setToDate("");
    if (filter === "sectorId") setSectorId("");
    if (filter === "status") setStatusFilter("all");
    if (filter === "hasBoxes") setHasBoxesOnly(false);
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await statusMutation.mutateAsync({ orderId, status });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders-summary"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders-history-summary"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Estado actualizado");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        const normalizedMessage = Array.isArray(message) ? message.join(", ") : message;
        toast.error(normalizedMessage || "No se pudo actualizar el estado");
      } else {
        toast.error("No se pudo actualizar el estado");
      }
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (isLoading) {
    return <CustomFullScreenLoading />;
  }

  return (
    <>
      <AdminTitle title="Historial" subtitle="Consulta de pedidos anteriores con filtros" />

      <Card className="mb-6 border-slate-200 shadow-sm">
        <CardContent className="space-y-4 bg-gradient-to-r from-white via-slate-50 to-white p-6">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Buscar cliente</label>
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
              <label className="text-sm font-medium text-gray-700">Buscar producto</label>
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
              <label className="text-sm font-medium text-gray-700">Sector</label>
              <select
                value={sectorId}
                onChange={(event) => setSectorId(event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Todos</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.title}
                  </option>
                ))}
              </select>
              {sectorId && (
                <div className="mt-2">
                  <SectorBadge title={selectedSector?.title} color={selectedSector?.color} />
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Desde</label>
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
              <label className="text-sm font-medium text-gray-700">Hasta</label>
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
            <div>
              <label className="text-sm font-medium text-gray-700">Estado</label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">Todos</option>
                {adminOrderStatusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={hasBoxesOnly}
                onChange={(event) => setHasBoxesOnly(event.target.checked)}
              />
              Solo pedidos con cajas
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSearch} disabled={isInvalidDateRange}>
              Buscar
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickRange(30)}>
              30 dias
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickRange(90)}>
              90 dias
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickRange(180)}>
              180 dias
            </Button>
            <Button variant="outline" onClick={handleClear}>
              <X className="h-4 w-4" />
              Limpiar
            </Button>
          </div>

          {isInvalidDateRange && (
            <p className="text-xs font-medium text-rose-600">
              La fecha inicial no puede ser mayor que la fecha final.
            </p>
          )}

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Filtros activos en el historial:</span>
              {searchParams.get("user") && (
                <button
                  type="button"
                  onClick={() => removeFilter("user")}
                  className={getFilterChipClassName(filterChipStyles.user)}
                >
                  Cliente: {searchParams.get("user")} x
                </button>
              )}
              {searchParams.get("product") && (
                <button
                  type="button"
                  onClick={() => removeFilter("product")}
                  className={getFilterChipClassName(filterChipStyles.product)}
                >
                  Producto: {searchParams.get("product")} x
                </button>
              )}
              {searchParams.get("fromDate") && (
                <button
                  type="button"
                  onClick={() => removeFilter("fromDate")}
                  className={getFilterChipClassName(filterChipStyles.fromDate)}
                >
                  Desde: {searchParams.get("fromDate")} x
                </button>
              )}
              {searchParams.get("toDate") && (
                <button
                  type="button"
                  onClick={() => removeFilter("toDate")}
                  className={getFilterChipClassName(filterChipStyles.toDate)}
                >
                  Hasta: {searchParams.get("toDate")} x
                </button>
              )}
              {searchParams.get("sectorId") && (
                <button
                  type="button"
                  onClick={() => removeFilter("sectorId")}
                  className={filterChipBaseClassName}
                  style={getSectorFilterChipStyle(selectedSector?.color)}
                >
                  Sector: {selectedSector?.title || "Seleccionado"} x
                </button>
              )}
              {searchParams.get("status") && (
                <button
                  type="button"
                  onClick={() => removeFilter("status")}
                  className={getFilterChipClassName(getStatusFilterChipStyle(searchParams.get("status")))}
                >
                  Estado: {adminOrderStatusOptions.find((item) => item.value === searchParams.get("status"))?.label} x
                </button>
              )}
              {searchParams.get("hasBoxes") === "true" && (
                <button
                  type="button"
                  onClick={() => removeFilter("hasBoxes")}
                  className={getFilterChipClassName(filterChipStyles.hasBoxes)}
                >
                  Con cajas x
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Pedidos</p>
            <p className="text-2xl font-semibold text-slate-900">
              {isSummaryLoading && !summaryData ? "-" : summary.total}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Volumen</p>
            <p className="text-xl font-semibold text-slate-900">
              {isSummaryLoading && !summaryData
                ? "-"
                : `${summary.totalKg} kg / ${summary.totalBoxes} cajas`}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Importe</p>
            <p className="text-xl font-semibold text-slate-900">
              {isSummaryLoading && !summaryData
                ? "-"
                : summary.hasBoxOrders
                ? "Precio no disponible (incluye cajas)"
                : currencyFormatter(summary.totalPrice)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Completados</p>
            <p className="text-2xl font-semibold text-slate-900">
              {isSummaryLoading && !summaryData ? "-" : summary.completed}
            </p>
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
                <TableHead>Sector</TableHead>
                <TableHead className="w-[320px]">Detalle</TableHead>
                <TableHead>Unidades</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead>Preparacion</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-sm text-gray-500">
                    {hasActiveFilters
                      ? "No hay pedidos para el filtro actual."
                      : "No hay pedidos en el historial."}
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{order.user?.fullName || "Sin nombre"}</span>
                        <span className="text-xs text-gray-500">
                          {order.user
                            ? [
                                order.user.employeeNumber
                                  ? `Func. ${order.user.employeeNumber}`
                                  : null,
                                order.user.nationalId ? `CI ${order.user.nationalId}` : null,
                              ]
                                .filter(Boolean)
                                .join(" , ") || "-"
                            : "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <SectorBadge
                        title={
                          order.sectorTitleSnapshot ||
                          order.user?.sector?.title ||
                          order.user?.sectorId
                        }
                        color={order.sectorColorSnapshot || order.user?.sector?.color}
                        fallback="-"
                      />
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <OrderItemsSummaryCell items={order.items} />
                    </TableCell>
                    <TableCell>{formatOrderUnitsSummary(order.items, order.totalKg)}</TableCell>
                    <TableCell>
                      {isOrderPriceAvailable(order.items)
                        ? currencyFormatter(order.totalPrice)
                        : "Precio no disponible"}
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{order.preparationDate || "-"}</TableCell>
                    <TableCell>
                      <select
                        value={order.status}
                        onChange={(event) =>
                          handleStatusChange(order.id, event.target.value as OrderStatus)
                        }
                        disabled={updatingOrderId === order.id || order.status === "completed"}
                        className={`h-9 rounded-md border px-3 text-sm font-medium ${adminOrderStatusStyles[order.status]}`}
                      >
                        {adminOrderStatusOptions.map((status) => (
                          <option
                            key={status.value}
                            value={status.value}
                            style={adminOrderStatusOptionStyles[status.value]}
                          >
                            {status.label}
                          </option>
                        ))}
                      </select>
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
