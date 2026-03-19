
const UYU_NUMBER_FORMATTER = new Intl.NumberFormat("es-UY", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const currencyFormatter = (value: number) => {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `$${UYU_NUMBER_FORMATTER.format(safeValue)}`;
};
