export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export interface OrderProduct {
  id: string;
  title: string;
  price: number;
  images: string[];
}

export interface OrderItem {
  id: string;
  kg: number;
  isBox: boolean;
  unitPrice: number;
  subtotal: number;
  product: OrderProduct;
}

export interface Order {
  id: string;
  status: OrderStatus;
  totalKg: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: {
    id: string;
    fullName: string;
    employeeNumber: string;
    nationalId: string;
    isSuperUser?: boolean;
  } | null;
}
