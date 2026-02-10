import { useState } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AdminTitle } from "@/admin/components/AdminTitle";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { currencyFormatter } from "@/lib/currency-formatter";
import { useAdminOrders } from "@/admin/hooks/useAdminOrders";
import { updateOrderStatusAction } from "@/admin/actions/update-order-status.action";
import type { Order, OrderStatus } from "@/interface/order.interface";

const statusOptions: Array<{ value: OrderStatus; label: string }> = [
  { value: "pending", label: "Pendiente" },
  { value: "completed", label: "Completado" },
  { value: "cancelled", label: "Cancelado" },
];

const formatDate = (value: string) =>
  new Date(value).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export const AdminOrdersPage = () => {
  const { data: orders = [], isLoading } = useAdminOrders();
  const queryClient = useQueryClient();
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: updateOrderStatusAction,
  });

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const updatedOrder = await mutation.mutateAsync({ orderId, status });
      queryClient.setQueryData<Order[] | undefined>(["admin-orders"], (prev) =>
        prev?.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)),
      );
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
          {orders.map((order) => (
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
                  className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};
