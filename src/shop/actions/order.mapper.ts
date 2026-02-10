import type { Order } from "@/interface/order.interface";

const mapImages = (images: string[]) =>
  images.map((image) => `${import.meta.env.VITE_API_URL}/files/product/${image}`);

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
