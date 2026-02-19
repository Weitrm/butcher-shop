import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { OrderItem } from "@/interface/order.interface";
import { formatOrderItemSummary } from "@/lib/order-unit";

interface OrderItemsSummaryCellProps {
  items: OrderItem[];
  maxVisibleItems?: number;
}

export const OrderItemsSummaryCell = ({
  items,
  maxVisibleItems = 2,
}: OrderItemsSummaryCellProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const itemSummaries = useMemo(
    () =>
      items.map((item) =>
        formatOrderItemSummary(item.product.title, item.kg, item.isBox),
      ),
    [items],
  );

  const shouldCollapse = itemSummaries.length > maxVisibleItems;
  const hiddenCount = Math.max(0, itemSummaries.length - maxVisibleItems);
  const visibleSummaries =
    shouldCollapse && !isExpanded
      ? itemSummaries.slice(0, maxVisibleItems)
      : itemSummaries;

  return (
    <div className="max-w-[320px] break-words text-sm text-gray-600">
      <span>
        {visibleSummaries.join(", ")}
        {shouldCollapse && !isExpanded ? `, +${hiddenCount} mas` : ""}
      </span>
      {shouldCollapse ? (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs"
          onClick={() => setIsExpanded((current) => !current)}
        >
          {isExpanded ? "Ver menos" : "Ver mas"}
        </Button>
      ) : null}
    </div>
  );
};
