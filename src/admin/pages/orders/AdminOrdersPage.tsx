import { useState, type CSSProperties } from "react";
import { useSearchParams } from "react-router";
import { Search, X } from "lucide-react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { OrderItemsSummaryCell } from "@/admin/components/orders/OrderItemsSummaryCell";
import { AdminTitle } from "@/admin/components/AdminTitle";
import { updateOrderStatusAction } from "@/admin/actions/update-order-status.action";
import { useAdminOrders } from "@/admin/hooks/useAdminOrders";
import { useAdminOrdersSummary } from "@/admin/hooks/useAdminOrdersSummary";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { CustomPagination } from "@/components/custom/CustomPagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { OrderStatus } from "@/interface/order.interface";
import { currencyFormatter } from "@/lib/currency-formatter";
import {
  formatOrderUnitsSummary,
  isOrderPriceAvailable,
} from "@/lib/order-unit";

const statusOptions: Array<{ value: OrderStatus; label: string }> = [
  { value: "pending", label: "Pendiente" },
  { value: "completed", label: "Completado" },
  { value: "cancelled", label: "Cancelado" },
];

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const statusOptionStyles: Record<OrderStatus, CSSProperties> = {
  pending: { backgroundColor: "#FEF3C7", color: "#92400E" },
  completed: { backgroundColor: "#DCFCE7", color: "#166534" },
  cancelled: { backgroundColor: "#FEE2E2", color: "#991B1B" },
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export const AdminOrdersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialUser = searchParams.get("user") || "";
  const initialProduct = searchParams.get("product") || "";
  const [userQuery, setUserQuery] = useState(initialUser);
  const [productQuery, setProductQuery] = useState(initialProduct);
  const { data, isLoading } = useAdminOrders({ scope: "week" });
  const { data: summaryData, isLoading: isSummaryLoading } = useAdminOrdersSummary({
    scope: "week",
  });
  const orders = data?.orders || [];
  const queryClient = useQueryClient();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const hasActiveFilters = Boolean(searchParams.get("user") || searchParams.get("product"));
  const summary = summaryData || { total: 0, pending: 0, completed: 0, cancelled: 0 };

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

  const handleSearch = () => {
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
    nextParams.set("page", "1");
    setSearchParams(nextParams);
  };

  const handleClear = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("user");
    nextParams.delete("product");
    nextParams.set("page", "1");
    setSearchParams(nextParams);
    setUserQuery("");
    setProductQuery("");
  };

  if (isLoading) {
    return <CustomFullScreenLoading />;
  }

  return (
    <>
      <AdminTitle title="Órdenes" subtitle="Pedidos de la semana" />

      <Card className="mb-6 border-slate-200 shadow-sm">
        <CardContent className="space-y-4 bg-gradient-to-r from-white via-slate-50 to-white p-6">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Buscar por cliente</label>
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
              <label className="text-sm font-medium text-gray-700">Buscar por producto</label>
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
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSearch}>Buscar</Button>
            <Button variant="outline" onClick={handleClear}>
              <X className="h-4 w-4" />
              Limpiar
            </Button>
          </div>

          {hasActiveFilters ? (
            <p className="text-xs text-slate-500">
              Filtros activos aplicados sobre los pedidos de la semana.
            </p>
          ) : null}
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

      <Table className="bg-white p-10 shadow-xs border border-gray-200 mb-10">
        <TableHeader>
          <TableRow>
            <TableHead>Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="w-[320px]">Detalle</TableHead>
            <TableHead>Unidades</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-sm text-gray-500">
                No hay pedidos registrados.
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
                            order.user.nationalId
                              ? `CI ${order.user.nationalId}`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" - ") || "-"
                        : "-"}
                    </span>
                  </div>
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
                <TableCell className="text-right">
                  <select
                    value={order.status}
                    onChange={(event) =>
                      handleStatusChange(order.id, event.target.value as OrderStatus)
                    }
                    disabled={updatingOrderId === order.id}
                    className={`h-9 rounded-md border px-3 text-sm font-medium ${statusStyles[order.status]}`}
                  >
                    {statusOptions.map((status) => (
                      <option
                        key={status.value}
                        value={status.value}
                        style={statusOptionStyles[status.value]}
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
    </>
  );
};
