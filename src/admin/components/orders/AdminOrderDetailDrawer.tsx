import { Button } from "@/components/ui/button";
import { SectorBadge } from "@/components/custom/SectorBadge";
import type { Order, OrderStatus } from "@/interface/order.interface";
import { formatOrderDisplayedPrice, formatOrderUnitsSummary } from "@/lib/order-unit";

import { AdminSideDrawer } from "../shared/AdminSideDrawer";
import { AdminOrderItemsList } from "./AdminOrderItemsList";
import {
  adminOrderStatusLabels,
  adminOrderStatusOptionStyles,
  adminOrderStatusOptions,
  adminOrderStatusStyles,
} from "./orderStatusUI";

interface AdminOrderDetailDrawerProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (orderId: string, status: OrderStatus) => Promise<void>;
  isUpdating: boolean;
}

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export const AdminOrderDetailDrawer = ({
  order,
  open,
  onOpenChange,
  onStatusChange,
  isUpdating,
}: AdminOrderDetailDrawerProps) => {
  if (!order) {
    return null;
  }

  return (
    <AdminSideDrawer
      open={open}
      onOpenChange={onOpenChange}
      side="start"
      title={`Pedido #${order.id.slice(0, 8)}`}
      description="Detalle completo del pedido y acciones rapidas"
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Revisa items, cliente y estado sin salir de la lista.
          </p>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${adminOrderStatusStyles[order.status]}`}
            >
              {adminOrderStatusLabels[order.status]}
            </span>
            <SectorBadge
              title={
                order.sectorTitleSnapshot || order.user?.sector?.title || order.user?.sectorId
              }
              color={order.sectorColorSnapshot || order.user?.sector?.color}
              fallback="Sin sector"
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white bg-white p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Cliente
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {order.user?.fullName || "Sin nombre"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {order.user
                  ? [
                      order.user.employeeNumber
                        ? `Func. ${order.user.employeeNumber}`
                        : null,
                      order.user.nationalId ? `CI ${order.user.nationalId}` : null,
                    ]
                      .filter(Boolean)
                      .join(" - ") || "-"
                  : "-"}
              </p>
            </div>

            <div className="rounded-xl border border-white bg-white p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Preparacion
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {order.preparationDate || "Sin fecha"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Creado {formatDateTime(order.createdAt)}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Estado del pedido</h3>
              <p className="text-xs text-slate-500">
                Cambia el estado sin perder el contexto de la lista.
              </p>
            </div>
          </div>

          <select
            value={order.status}
            onChange={(event) => onStatusChange(order.id, event.target.value as OrderStatus)}
            disabled={isUpdating || order.status === "completed"}
            className={`mt-3 h-10 w-full rounded-md border px-3 text-sm font-medium ${adminOrderStatusStyles[order.status]}`}
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
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Items del pedido</h3>
              <p className="text-xs text-slate-500">
                {order.items.length} item{order.items.length === 1 ? "" : "s"} en este pedido
              </p>
            </div>
          </div>

          <div className="mt-4">
            <AdminOrderItemsList items={order.items} />
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Unidades
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatOrderUnitsSummary(order.items, order.totalKg)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Total
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatOrderDisplayedPrice(order.totalPrice, order.items)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Ultima actualizacion
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatDateTime(order.updatedAt)}
            </p>
          </div>
        </section>
      </div>
    </AdminSideDrawer>
  );
};
