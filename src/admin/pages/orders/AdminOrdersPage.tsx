import { useState, type CSSProperties } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AdminTitle } from "@/admin/components/AdminTitle";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { CustomPagination } from "@/components/custom/CustomPagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { currencyFormatter } from "@/lib/currency-formatter";
import { useAdminOrders } from "@/admin/hooks/useAdminOrders";
import { updateOrderStatusAction } from "@/admin/actions/update-order-status.action";
import type { OrderStatus } from "@/interface/order.interface";

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
  const { data, isLoading } = useAdminOrders();
  const orders = data?.orders || [];
  const queryClient = useQueryClient();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const summary = orders.reduce(
    (acc, order) => {
      acc.total += 1;
      if (order.status === "pending") acc.pending += 1;
      if (order.status === "completed") acc.completed += 1;
      if (order.status === "cancelled") acc.cancelled += 1;
      return acc;
    },
    { total: 0, pending: 0, completed: 0, cancelled: 0 },
  );

  const mutation = useMutation({
    mutationFn: updateOrderStatusAction,
  });

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await mutation.mutateAsync({ orderId, status });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
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
      <AdminTitle title="Ordenes" subtitle="Gestion de pedidos" />

      <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-xs">
          <p className="text-xs uppercase tracking-wide text-gray-500">Total</p>
          <p className="text-2xl font-semibold text-gray-900">{summary.total}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-xs">
          <p className="text-xs uppercase tracking-wide text-gray-500">Pendientes</p>
          <p className="text-2xl font-semibold text-gray-900">{summary.pending}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-xs">
          <p className="text-xs uppercase tracking-wide text-gray-500">Completados</p>
          <p className="text-2xl font-semibold text-gray-900">{summary.completed}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-xs">
          <p className="text-xs uppercase tracking-wide text-gray-500">Cancelados</p>
          <p className="text-2xl font-semibold text-gray-900">{summary.cancelled}</p>
        </div>
      </div>

      <Table className="bg-white p-10 shadow-xs border border-gray-200 mb-10">
        <TableHeader>
          <TableRow>
            <TableHead>Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Detalle</TableHead>
            <TableHead>Kg</TableHead>
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
                    <span className="text-xs text-gray-500">{order.user?.email || "-"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[260px] truncate text-sm text-gray-600">
                    {order.items
                      .map((item) => `${item.product.title} (${item.kg}kg)`)
                      .join(", ")}
                  </div>
                </TableCell>
                <TableCell>{order.totalKg} kg</TableCell>
                <TableCell>{currencyFormatter(order.totalPrice)}</TableCell>
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
