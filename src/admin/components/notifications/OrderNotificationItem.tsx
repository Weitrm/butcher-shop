import type { AdminOrderNotification } from "@/admin/hooks/useAdminOrderNotifications";
import { currencyFormatter } from "@/lib/currency-formatter";
import {
  formatOrderItemSummary,
  formatOrderUnitsSummary,
  isOrderPriceAvailable,
} from "@/lib/order-unit";

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

interface OrderNotificationItemProps {
  notification: AdminOrderNotification;
  onOpenOrder: (notification: AdminOrderNotification) => void;
  onMarkAsRead: (notificationId: string) => void;
}

export const OrderNotificationItem = ({
  notification,
  onOpenOrder,
  onMarkAsRead,
}: OrderNotificationItemProps) => {
  const { order, isRead } = notification;
  const items = order.items
    .map((item) => {
      const title = item.product?.title || "Producto";
      return formatOrderItemSummary(title, item.kg, item.isBox);
    })
    .filter(Boolean);
  const previewItems = items.slice(0, 2);
  const remainingItems = items.length - previewItems.length;
  const userLabel = order.user?.employeeNumber
    ? `Func. ${order.user.employeeNumber}`
    : order.user?.fullName || "Cliente";

  return (
    <div
      className={`rounded-xl border p-3 transition-colors ${
        isRead ? "border-gray-200 bg-white" : "border-blue-200 bg-blue-50/70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {!isRead && <span className="h-2 w-2 rounded-full bg-blue-600" />}
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Nuevo pedido
            </p>
          </div>
          <p className="mt-1 text-sm font-semibold text-gray-900">#{order.id.slice(0, 8)}</p>
          <p className="text-xs text-gray-500">{userLabel}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ${
            statusStyles[order.status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {statusLabels[order.status] || order.status}
        </span>
      </div>

      <p className="mt-3 text-xs text-gray-600">
        {previewItems.length > 0 ? previewItems.join(", ") : "Sin items"}
        {remainingItems > 0 ? ` y ${remainingItems} mas...` : ""}
      </p>

      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-gray-500">
        <span>{formatDate(order.createdAt)}</span>
        <span className="text-right font-semibold text-gray-900">
          {isOrderPriceAvailable(order.items)
            ? currencyFormatter(order.totalPrice)
            : "Precio no disponible"}{" "}
          - {formatOrderUnitsSummary(order.items, order.totalKg)}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onOpenOrder(notification)}
          className="inline-flex items-center rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-800"
        >
          Ver pedido
        </button>
        {!isRead && (
          <button
            type="button"
            onClick={() => onMarkAsRead(notification.id)}
            className="inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
          >
            Marcar leida
          </button>
        )}
      </div>
    </div>
  );
};
