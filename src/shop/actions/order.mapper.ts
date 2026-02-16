import type { Order } from "@/interface/order.interface";
import { resolveProductImageUrl } from "@/lib/product-image";

const mapImages = (images: string[]) =>
  images.map(resolveProductImageUrl);

export const mapOrderImages = (order: Order): Order => ({
  ...order,
  items: order.items.map((item) => ({
    ...item,
    product: {
      ...item.product,
      images: mapImages(item.product.images || []),
    },
  })),
});

export const mapOrdersImages = (orders: Order[]) => orders.map(mapOrderImages);
