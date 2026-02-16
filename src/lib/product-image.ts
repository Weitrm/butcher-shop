const isAbsoluteImageUrl = (value: string) =>
  value.startsWith("http://") ||
  value.startsWith("https://") ||
  value.startsWith("data:");

export const resolveProductImageUrl = (value: string) => {
  if (!value) return value;
  if (isAbsoluteImageUrl(value)) return value;

  return `${import.meta.env.VITE_API_URL}/files/product/${value}`;
};

export const normalizeProductImageForSave = (value: string) => {
  if (!value) return "";

  const localPrefix = `${import.meta.env.VITE_API_URL}/files/product/`;
  if (value.startsWith(localPrefix)) {
    return value.slice(localPrefix.length);
  }

  return value;
};
