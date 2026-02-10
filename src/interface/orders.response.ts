import type { Order } from "./order.interface";

export interface OrdersResponse {
  count: number;
  pages: number;
  orders: Order[];
}
