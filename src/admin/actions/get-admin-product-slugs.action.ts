import { getAdminProductsAction } from "./get-admin-products.action";

const PRODUCT_SLUGS_PAGE_SIZE = 100;

export const getAdminProductSlugsAction = async (): Promise<string[]> => {
  const slugs = new Set<string>();
  let offset = 0;
  let total = 0;

  do {
    const response = await getAdminProductsAction({
      limit: PRODUCT_SLUGS_PAGE_SIZE,
      offset,
    });

    total = response.count;
    response.products.forEach((product) => {
      if (!product.slug) return;
      slugs.add(product.slug.trim().toLowerCase());
    });
    offset += PRODUCT_SLUGS_PAGE_SIZE;
  } while (offset < total);

  return [...slugs].sort((a, b) => a.localeCompare(b));
};

