import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { OrderItem } from "@/interface/order.interface";
import { currencyFormatter } from "@/lib/currency-formatter";
import { formatQuantityWithUnit } from "@/lib/order-unit";
import { cn } from "@/lib/utils";

interface AdminOrderItemsListProps {
  items: OrderItem[];
  compact?: boolean;
  maxVisibleItems?: number;
  onViewMore?: () => void;
}

export const AdminOrderItemsList = ({
  items,
  compact = false,
  maxVisibleItems,
  onViewMore,
}: AdminOrderItemsListProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldCollapse =
    compact && typeof maxVisibleItems === "number" && items.length > maxVisibleItems;
  const visibleItems =
    shouldCollapse && !isExpanded && typeof maxVisibleItems === "number"
      ? items.slice(0, maxVisibleItems)
      : items;
  const hiddenCount = Math.max(0, items.length - visibleItems.length);

  if (items.length === 0) {
    return <p className="text-sm text-slate-500">Sin items cargados.</p>;
  }

  return (
    <div className="space-y-2">
      {visibleItems.map((item) =>
        compact ? (
          <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
            <p className="truncate text-slate-700">{item.product.title}</p>
            <span
              className={cn(
                "shrink-0 text-xs font-medium",
                item.isBox ? "text-orange-700" : "text-slate-500",
              )}
            >
              {formatQuantityWithUnit(item.kg, item.isBox)}
            </span>
          </div>
        ) : (
          <div
            key={item.id}
            className={cn(
              "rounded-xl border border-slate-200 bg-white",
              compact ? "p-2.5" : "p-3.5",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {item.product.title}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                    {formatQuantityWithUnit(item.kg, item.isBox)}
                  </span>
                  {item.isBox ? (
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-medium text-orange-800">
                      Caja
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">
                      Unitario {currencyFormatter(item.unitPrice)}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  Subtotal
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {item.isBox ? "No disponible" : currencyFormatter(item.subtotal)}
                </p>
              </div>
            </div>
          </div>
        ),
      )}

      {hiddenCount > 0 ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto px-0 text-xs text-slate-600"
            onClick={() => setIsExpanded((current) => !current)}
          >
            {isExpanded
              ? "Ver menos"
              : `Ver ${hiddenCount} item${hiddenCount === 1 ? "" : "s"} mas`}
          </Button>
          {onViewMore ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto px-0 text-xs text-slate-600"
              onClick={onViewMore}
            >
              Abrir detalle
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
