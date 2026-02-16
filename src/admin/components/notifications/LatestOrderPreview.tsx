import type { Order } from "@/interface/order.interface";
import { currencyFormatter } from "@/lib/currency-formatter";
import { Link } from "react-router";

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  completed: "Completado",
  cancelled: "Cancelado",
};

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString("es-UY", {
    dateStyle: "medium",
    timeStyle: "short",
  });

interface LatestOrderPreviewProps {
  order: Order | null;
  isLoading: boolean;
}

export const LatestOrderPreview = ({ order, isLoading }: LatestOrderPreviewProps) => {
  if (isLoading) {
    return <div className="px-4 py-4 text-sm text-gray-500">Cargando pedido...</div>;
  }

  if (!order) {
    return <div className="px-4 py-4 text-sm text-gray-500">No hay pedidos recientes.</div>;
  }

  const items = order.items
    .map((item) => {
      const title = item.product?.title || "Producto";
      return `${title} (${item.kg}kg${item.isBox ? ", caja" : ""})`;
    })
    .filter(Boolean);
  const previewItems = items.slice(0, 3);
  const remainingItems = items.length - previewItems.length;
  const userLabel = order.user?.employeeNumber
    ? `Func. ${order.user.employeeNumber}`
    : order.user?.fullName || "Cliente";

  return (
    <div className="px-4 py-4 text-sm text-gray-700">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gray-400">Pedido</p>
          <p className="font-semibold text-gray-900">#{order.id.slice(0, 8)}</p>
          <p className="text-xs text-gray-500">{userLabel}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            statusStyles[order.status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {statusLabels[order.status] || order.status}
        </span>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        {previewItems.length > 0 ? previewItems.join(", ") : "Sin items"}
        {remainingItems > 0 ? ` y ${remainingItems} mas...` : ""}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>{formatDate(order.createdAt)}</span>
        <span className="font-semibold text-gray-900">
          {currencyFormatter(order.totalPrice)} - {order.totalKg} kg
        </span>
      </div>

      <Link
        to="/admin/orders"
        className="mt-4 inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700"
      >
        Ver pedidos
      </Link>
    </div>
  );
};
