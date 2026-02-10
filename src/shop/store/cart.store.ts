import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  kg: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => { ok: boolean; error?: string };
  updateItemKg: (productId: string, kg: number) => { ok: boolean; error?: string };
  removeItem: (productId: string) => void;
  clear: () => void;
  getTotalKg: () => number;
  getTotalPrice: () => number;
  getTotalItems: () => number;
};

const MAX_TOTAL_KG = 10;
const MAX_ITEMS = 2;

const isInvalidKg = (kg: number) =>
  !Number.isFinite(kg) || !Number.isInteger(kg) || kg < 1;

const validateItems = (items: CartItem[]) => {
  if (items.length > MAX_ITEMS) {
    return 'Solo se permiten 2 productos por pedido';
  }

  const totalKg = items.reduce((total, item) => total + item.kg, 0);
  if (totalKg > MAX_TOTAL_KG) {
    return 'El total no puede superar los 10 kg';
  }

  return null;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        if (isInvalidKg(item.kg)) {
          return { ok: false, error: 'Ingresa un valor de kg valido' };
        }

        const items = get().items;
        const existing = items.find((cartItem) => cartItem.productId === item.productId);
        const nextItems = existing
          ? items.map((cartItem) =>
              cartItem.productId === item.productId
                ? { ...cartItem, ...item, kg: item.kg }
                : cartItem,
            )
          : [...items, item];

        const error = validateItems(nextItems);
        if (error) return { ok: false, error };

        set({ items: nextItems });
        return { ok: true };
      },
      updateItemKg: (productId, kg) => {
        if (isInvalidKg(kg)) {
          return { ok: false, error: 'Ingresa un valor de kg valido' };
        }

        const items = get().items;
        const exists = items.some((item) => item.productId === productId);
        if (!exists) {
          return { ok: false, error: 'Producto no encontrado en el pedido' };
        }

        const nextItems = items.map((item) =>
          item.productId === productId ? { ...item, kg } : item,
        );

        const error = validateItems(nextItems);
        if (error) return { ok: false, error };

        set({ items: nextItems });
        return { ok: true };
      },
      removeItem: (productId) =>
        set({ items: get().items.filter((item) => item.productId !== productId) }),
      clear: () => set({ items: [] }),
      getTotalKg: () => get().items.reduce((total, item) => total + item.kg, 0),
      getTotalPrice: () =>
        get().items.reduce((total, item) => total + item.kg * item.price, 0),
      getTotalItems: () => get().items.length,
    }),
    {
      name: 'butcher-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
