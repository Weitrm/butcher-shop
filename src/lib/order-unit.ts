export const getUnitLabel = (isBox: boolean, quantity = 1) => {
  if (!isBox) return "kg";
  return quantity === 1 ? "caja" : "cajas";
};

export const formatQuantityWithUnit = (quantity: number, isBox: boolean) =>
  `${quantity} ${getUnitLabel(isBox, quantity)}`;

export const formatOrderItemDetail = (quantity: number, unitPrice: number, isBox: boolean) =>
  isBox
    ? `${formatQuantityWithUnit(quantity, isBox)} (precio no disponible)`
    : `${formatQuantityWithUnit(quantity, isBox)} x $${unitPrice}`;

export const formatOrderItemSummary = (
  productTitle: string,
  quantity: number,
  isBox: boolean,
) => `${productTitle} (${formatQuantityWithUnit(quantity, isBox)})`;

type UnitItemLike = {
  kg: number;
  isBox: boolean;
};

export const hasBoxItems = (items: UnitItemLike[]) =>
  items.some((item) => item.isBox);

export const isOrderPriceAvailable = (items: UnitItemLike[]) =>
  !hasBoxItems(items);

export const getOrderUnits = (items: UnitItemLike[]) =>
  items.reduce(
    (acc, item) => {
      if (item.isBox) {
        acc.totalBoxes += item.kg;
      } else {
        acc.totalKg += item.kg;
      }
      return acc;
    },
    { totalKg: 0, totalBoxes: 0 },
  );

export const formatOrderUnitsSummary = (
  items: UnitItemLike[],
  fallbackTotalKg?: number,
) => {
  const { totalKg, totalBoxes } = getOrderUnits(items);
  const parts: string[] = [];

  if (totalKg > 0 || (totalBoxes === 0 && Number.isFinite(fallbackTotalKg))) {
    parts.push(`${totalKg || Math.floor(Number(fallbackTotalKg || 0))} kg`);
  }
  if (totalBoxes > 0) {
    parts.push(`${totalBoxes} ${getUnitLabel(true, totalBoxes)}`);
  }

  return parts.join(" + ");
};
