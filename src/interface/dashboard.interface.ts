import type { OrderStatus } from "./order.interface";

export interface DashboardTopProduct {
  productId: string;
  title: string;
  slug: string;
  totalKg: number;
  totalOrders: number;
}

export interface DashboardOrderCounts {
  day: number;
  week: number;
  month: number;
}

export interface DashboardRecentOrderItem {
  id: string;
  kg: number;
  product: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

export interface DashboardRecentOrder {
  id: string;
  status: OrderStatus;
  totalKg: number;
  totalPrice: number;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  items: DashboardRecentOrderItem[];
}

export interface DashboardStats {
  orderCounts: DashboardOrderCounts;
  topProducts: DashboardTopProduct[];
  topProductsCount: number;
  topProductsPages: number;
  recentOrders: DashboardRecentOrder[];
}
