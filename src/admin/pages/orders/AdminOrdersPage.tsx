import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useSearchParams } from "react-router";
import { CalendarDays, Search, X } from "lucide-react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateOrderStatusAction } from "@/admin/actions/update-order-status.action";
import { AdminTitle } from "@/admin/components/AdminTitle";
import { AdminOrderDetailDrawer } from "@/admin/components/orders/AdminOrderDetailDrawer";
import { AdminOrderItemsList } from "@/admin/components/orders/AdminOrderItemsList";
import {
  adminOrderStatusOptionStyles,
  adminOrderStatusOptions,
  adminOrderStatusStyles,
} from "@/admin/components/orders/orderStatusUI";
import { useAdminOrders } from "@/admin/hooks/useAdminOrders";
import { useAdminOrdersSummary } from "@/admin/hooks/useAdminOrdersSummary";
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

type OrdersFilterState = {
  user: string;
  product: string;
  sectorId: string;
  preparationDate: string;
  status: string;
  hasBoxes: boolean;
};

const getOrdersFilterStateKey = (filters: OrdersFilterState) =>
  JSON.stringify(filters);

const buildOrdersSearchParams = (filters: OrdersFilterState) => {
  const nextParams = new URLSearchParams();

  if (filters.user) nextParams.set("user", filters.user);
  if (filters.product) nextParams.set("product", filters.product);
  if (filters.sectorId) nextParams.set("sectorId", filters.sectorId);
  if (filters.preparationDate) nextParams.set("preparationDate", filters.preparationDate);
  if (filters.status && filters.status !== "all") nextParams.set("status", filters.status);
  if (filters.hasBoxes) nextParams.set("hasBoxes", "true");

  nextParams.set("page", "1");
  return nextParams;
};

const filterChipStyles = {
  user: "border-slate-200 bg-slate-100 text-slate-700",
  product: "border-blue-200 bg-blue-100 text-blue-800",
  sector: "border-violet-200 bg-violet-100 text-violet-800",
  preparationDate: "border-amber-200 bg-amber-100 text-amber-800",
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

export const AdminOrdersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialUser = searchParams.get("user") || "";
  const initialProduct = searchParams.get("product") || "";
  const initialSectorId = searchParams.get("sectorId") || "";
  const initialPreparationDate = searchParams.get("preparationDate") || "";
  const initialStatus = searchParams.get("status") || "all";
  const initialHasBoxes = searchParams.get("hasBoxes") === "true";
  const [userQuery, setUserQuery] = useState(initialUser);
  const [productQuery, setProductQuery] = useState(initialProduct);
  const [debouncedUserQuery, setDebouncedUserQuery] = useState(initialUser.trim());
  const [debouncedProductQuery, setDebouncedProductQuery] = useState(initialProduct.trim());
  const [sectorId, setSectorId] = useState(initialSectorId);
  const [preparationDate, setPreparationDate] = useState(initialPreparationDate);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [hasBoxesOnly, setHasBoxesOnly] = useState(initialHasBoxes);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const lastAppliedFiltersRef = useRef(
    getOrdersFilterStateKey({
      user: initialUser.trim(),
      product: initialProduct.trim(),
      sectorId: initialSectorId,
      preparationDate: initialPreparationDate,
      status: initialStatus,
      hasBoxes: initialHasBoxes,
    }),
  );
  const { data: sectors = [] } = useAdminSectors();
  const { data, isLoading, isFetching } = useAdminOrders({
    scope: "week",
    sort: "statusEmployeeAsc",
  });
  const { data: summaryData, isLoading: isSummaryLoading, isFetching: isSummaryFetching } =
    useAdminOrdersSummary({
      scope: "week",
    });
  const orders = useMemo(() => data?.orders ?? [], [data?.orders]);
  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || null,
    [orders, selectedOrderId],
  );
  const queryClient = useQueryClient();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const hasActiveFilters = Boolean(
      searchParams.get("user") ||
      searchParams.get("product") ||
      searchParams.get("sectorId") ||
      searchParams.get("preparationDate") ||
      searchParams.get("status") ||
      searchParams.get("hasBoxes"),
  );
  const summary = summaryData || { total: 0, pending: 0, completed: 0, cancelled: 0 };
  const selectedSector = sectors.find((sector) => sector.id === sectorId);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedUserQuery(userQuery.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [userQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedProductQuery(productQuery.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [productQuery]);

  useEffect(() => {
    const filters: OrdersFilterState = {
      user: debouncedUserQuery,
      product: debouncedProductQuery,
      sectorId,
      preparationDate,
      status: statusFilter,
      hasBoxes: hasBoxesOnly,
    };
    const nextKey = getOrdersFilterStateKey(filters);

    if (lastAppliedFiltersRef.current === nextKey) {
      return;
    }

    lastAppliedFiltersRef.current = nextKey;
    setSearchParams(buildOrdersSearchParams(filters), { replace: true });
  }, [
    debouncedProductQuery,
    debouncedUserQuery,
    hasBoxesOnly,
    preparationDate,
    sectorId,
    setSearchParams,
    statusFilter,
  ]);

  useEffect(() => {
    if (selectedOrderId && !selectedOrder) {
      setSelectedOrderId(null);
    }
  }, [selectedOrder, selectedOrderId]);

  const statusMutation = useMutation({
    mutationFn: updateOrderStatusAction,
  });

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await statusMutation.mutateAsync({ orderId, status });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders-summary"] });
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

  const handleClear = () => {
    setUserQuery("");
    setProductQuery("");
    setDebouncedUserQuery("");
    setDebouncedProductQuery("");
    setSectorId("");
    setPreparationDate("");
    setStatusFilter("all");
    setHasBoxesOnly(false);
  };

  const applyPreset = (preset: "pending" | "boxes" | "today" | "clear") => {
    if (preset === "clear") {
      handleClear();
      return;
    }

    if (preset === "pending") {
      setUserQuery("");
      setProductQuery("");
      setDebouncedUserQuery("");
      setDebouncedProductQuery("");
      setSectorId("");
      setPreparationDate("");
      setStatusFilter("pending");
      setHasBoxesOnly(false);
    }

    if (preset === "boxes") {
      setUserQuery("");
      setProductQuery("");
      setDebouncedUserQuery("");
      setDebouncedProductQuery("");
      setSectorId("");
      setPreparationDate("");
      setStatusFilter("all");
      setHasBoxesOnly(true);
    }

    if (preset === "today") {
      const today = toDateInputValue(new Date());
      setUserQuery("");
      setProductQuery("");
      setDebouncedUserQuery("");
      setDebouncedProductQuery("");
      setSectorId("");
      setStatusFilter("all");
      setHasBoxesOnly(false);
      setPreparationDate(today);
    }
  };

  const removeFilter = (
    filter: "user" | "product" | "sectorId" | "preparationDate" | "status" | "hasBoxes",
  ) => {
    if (filter === "user") {
      setUserQuery("");
      setDebouncedUserQuery("");
    }
    if (filter === "product") {
      setProductQuery("");
      setDebouncedProductQuery("");
    }
    if (filter === "sectorId") setSectorId("");
    if (filter === "preparationDate") setPreparationDate("");
    if (filter === "status") setStatusFilter("all");
    if (filter === "hasBoxes") setHasBoxesOnly(false);
  };

  if (isLoading) {
    return <CustomFullScreenLoading />;
  }

  return (
    <>
      <AdminTitle title="Ordenes" subtitle="Vista semanal de pedidos" />

      <Card className="mb-6 border-slate-200 shadow-sm">
        <CardContent className="space-y-4 bg-gradient-to-r from-white via-slate-50 to-white p-6">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
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
              <label className="text-sm font-medium text-gray-700">Fecha de preparacion</label>
              <div className="relative mt-2">
                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="date"
                  value={preparationDate}
                  onChange={(event) => setPreparationDate(event.target.value)}
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
            <Button type="button" variant="outline" size="sm" onClick={() => applyPreset("pending")}>
              Pendientes
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyPreset("boxes")}>
              Con cajas
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyPreset("today")}>
              Hoy
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => applyPreset("clear")}>
              Sin filtros
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              {isFetching || isSummaryFetching
                ? "Actualizando resultados..."
                : "Los filtros se aplican automaticamente."}
            </p>
            <Button variant="outline" onClick={handleClear}>
              <X className="h-4 w-4" />
              Limpiar
            </Button>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Filtros activos en la vista semanal:</span>
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
              {searchParams.get("preparationDate") && (
                <button
                  type="button"
                  onClick={() => removeFilter("preparationDate")}
                  className={getFilterChipClassName(filterChipStyles.preparationDate)}
                >
                  Preparacion: {searchParams.get("preparationDate")} x
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

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-xs">
            <p className="text-xs uppercase tracking-wide text-gray-500">Total</p>
          <p className="text-2xl font-semibold text-gray-900">
            {isSummaryLoading && !summaryData ? "-" : summary.total}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-xs">
          <p className="text-xs uppercase tracking-wide text-gray-500">Pendientes</p>
          <p className="text-2xl font-semibold text-gray-900">
            {isSummaryLoading && !summaryData ? "-" : summary.pending}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-xs">
          <p className="text-xs uppercase tracking-wide text-gray-500">Completados</p>
          <p className="text-2xl font-semibold text-gray-900">
            {isSummaryLoading && !summaryData ? "-" : summary.completed}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-xs">
          <p className="text-xs uppercase tracking-wide text-gray-500">Cancelados</p>
          <p className="text-2xl font-semibold text-gray-900">
            {isSummaryLoading && !summaryData ? "-" : summary.cancelled}
          </p>
        </div>
      </div>

      <Table className="mb-10 border border-gray-200 bg-white p-10 shadow-xs">
        <TableHeader>
          <TableRow>
            <TableHead>Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead className="w-[360px]">Items</TableHead>
            <TableHead>Unidades</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead>Preparacion</TableHead>
            <TableHead className="text-right">Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-sm text-gray-500">
                    No hay pedidos en esta vista.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow
                key={order.id}
                className={selectedOrderId === order.id ? "bg-sky-50/60" : undefined}
              >
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <span className="font-semibold text-slate-900">#{order.id.slice(0, 8)}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto justify-start px-0 text-xs text-slate-600"
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      Ver detalle
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-500">{order.user?.fullName || "Sin nombre"}</span>
                    <span className="text-xs font-bold">
                      {order.user
                        ? [
                            order.user.employeeNumber ? `Func. ${order.user.employeeNumber}` : null,
                            order.user.nationalId ? `CI ${order.user.nationalId}` : null,
                          ]
                            .filter(Boolean)
                            .join(" - ") || "-"
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
                  <AdminOrderItemsList
                    items={order.items}
                    compact
                    maxVisibleItems={2}
                    onViewMore={() => setSelectedOrderId(order.id)}
                  />
                </TableCell>
                <TableCell>{formatOrderUnitsSummary(order.items, order.totalKg)}</TableCell>
                <TableCell>
                  {isOrderPriceAvailable(order.items)
                    ? currencyFormatter(order.totalPrice)
                    : "Precio no disponible"}
                </TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>{order.preparationDate || "-"}</TableCell>
                <TableCell className="text-right">
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
      <CustomPagination totalPages={data?.pages || 0} />

      <AdminOrderDetailDrawer
        order={selectedOrder}
        open={Boolean(selectedOrder)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOrderId(null);
          }
        }}
        onStatusChange={handleStatusChange}
        isUpdating={Boolean(selectedOrder && updatingOrderId === selectedOrder.id)}
      />
    </>
  );
};
