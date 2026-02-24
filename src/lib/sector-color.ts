const DEFAULT_SECTOR_COLOR = "#E2E8F0";
const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export const normalizeSectorColor = (value?: string | null) => {
  if (!value) return DEFAULT_SECTOR_COLOR;
  const normalized = value.trim();
  return HEX_COLOR_PATTERN.test(normalized) ? normalized.toUpperCase() : DEFAULT_SECTOR_COLOR;
};

export const getSectorTextColor = (backgroundColor?: string | null) => {
  const safeColor = normalizeSectorColor(backgroundColor);
  const red = Number.parseInt(safeColor.slice(1, 3), 16);
  const green = Number.parseInt(safeColor.slice(3, 5), 16);
  const blue = Number.parseInt(safeColor.slice(5, 7), 16);
  const yiq = (red * 299 + green * 587 + blue * 114) / 1000;
  return yiq >= 160 ? "#111827" : "#F9FAFB";
};

