
const UYU_FORMATTER = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "UYU",
  currencyDisplay: "narrowSymbol",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const currencyFormatter = (value: number) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  return UYU_FORMATTER.format(safeValue);
};
