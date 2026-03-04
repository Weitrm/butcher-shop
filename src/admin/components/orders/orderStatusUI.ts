import type { CSSProperties } from "react";

import type { OrderStatus } from "@/interface/order.interface";

export const adminOrderStatusOptions: Array<{ value: OrderStatus; label: string }> = [
  { value: "pending", label: "Pendiente" },
  { value: "completed", label: "Completado" },
  { value: "cancelled", label: "Cancelado" },
];

export const adminOrderStatusLabels: Record<OrderStatus, string> = {
  pending: "Pendiente",
  completed: "Completado",
  cancelled: "Cancelado",
};

export const adminOrderStatusStyles: Record<OrderStatus, string> = {
  pending: "border-yellow-200 bg-yellow-100 text-yellow-800",
  completed: "border-green-200 bg-green-100 text-green-800",
  cancelled: "border-red-200 bg-red-100 text-red-800",
};

export const adminOrderStatusOptionStyles: Record<OrderStatus, CSSProperties> = {
  pending: { backgroundColor: "#FEF3C7", color: "#92400E" },
  completed: { backgroundColor: "#DCFCE7", color: "#166534" },
  cancelled: { backgroundColor: "#FEE2E2", color: "#991B1B" },
};
