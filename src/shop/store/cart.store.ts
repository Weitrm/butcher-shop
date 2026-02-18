import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  kg: number;
  maxKgPerOrder: number;
  allowBoxes: boolean;
  isBox: boolean;
};

type CartValidationOptions = {
  ignoreLimits?: boolean;
};

type CartState = {
  items: CartItem[];
  maxTotalKg: number;
  maxItems: number;
  setMaxTotalKg: (maxTotalKg: number) => void;
  setMaxItems: (maxItems: number) => void;
  addItem: (
    item: CartItem,
    options?: CartValidationOptions,
  ) => { ok: boolean; error?: string };
  updateItemKg: (
    productId: string,
    kg: number,
    options?: CartValidationOptions,
  ) => { ok: boolean; error?: string };
  updateItemIsBox: (productId: string, isBox: boolean) => { ok: boolean; error?: string };
  removeItem: (productId: string) => void;
  clear: () => void;
  getTotalKg: () => number;
  getTotalPrice: () => number;
  getTotalItems: () => number;
};

const DEFAULT_MAX_TOTAL_KG = 10;
const DEFAULT_MAX_ITEMS = 2;

const isInvalidKg = (kg: number) =>
  !Number.isFinite(kg) || !Number.isInteger(kg) || kg < 1;

const safeMaxKg = (value: number | undefined) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_MAX_TOTAL_KG;
  return Math.floor(parsed);
};

const safeMaxItems = (value: number | undefined) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_MAX_ITEMS;
  return Math.floor(parsed);
};

const normalizeCartItem = (item: Partial<CartItem>): CartItem => ({
  productId: item.productId || "",
  name: item.name || "",
  price: Number(item.price || 0),
  image: item.image || "",
  kg: Math.max(1, Math.floor(Number(item.kg || 1))),
  maxKgPerOrder: safeMaxKg(item.maxKgPerOrder),
  allowBoxes: Boolean(item.allowBoxes),
  isBox: Boolean(item.isBox) && Boolean(item.allowBoxes),
});

const validateItems = (
  items: CartItem[],
  maxTotalKg: number,
  maxItems: number,
  options?: CartValidationOptions,
) => {
  if (items.some((item) => item.isBox && !item.allowBoxes)) {
    return "Uno o más productos no permiten pedidos por caja";
  }

  if (!options?.ignoreLimits) {
    if (items.length > safeMaxItems(maxItems)) {
      return `Solo se permiten ${safeMaxItems(maxItems)} productos por pedido`;
    }

    for (const item of items) {
      if (item.kg > safeMaxKg(item.maxKgPerOrder)) {
        return `El producto ${item.name} no permite más de ${safeMaxKg(item.maxKgPerOrder)} kg`;
      }
    }

    const totalKg = items.reduce((total, item) => total + item.kg, 0);
    if (totalKg > maxTotalKg) {
      return `El total no puede superar los ${maxTotalKg} kg`;
    }
  }

  return null;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      maxTotalKg: DEFAULT_MAX_TOTAL_KG,
      maxItems: DEFAULT_MAX_ITEMS,
      setMaxTotalKg: (maxTotalKg) =>
        set({
          maxTotalKg:
            Number.isFinite(maxTotalKg) && maxTotalKg > 0
              ? Math.floor(maxTotalKg)
              : DEFAULT_MAX_TOTAL_KG,
        }),
      setMaxItems: (maxItems) =>
        set({
          maxItems:
            Number.isFinite(maxItems) && maxItems > 0
              ? Math.floor(maxItems)
              : DEFAULT_MAX_ITEMS,
        }),
      addItem: (item, options) => {
        const normalizedItem = normalizeCartItem(item);
        if (isInvalidKg(normalizedItem.kg)) {
          return { ok: false, error: "Ingresa un valor de kg valido" };
        }

        const items = get().items.map(normalizeCartItem);
        const existing = items.find(
          (cartItem) => cartItem.productId === normalizedItem.productId,
        );
        const nextItems = existing
          ? items.map((cartItem) =>
              cartItem.productId === normalizedItem.productId
                ? { ...cartItem, ...normalizedItem, kg: normalizedItem.kg }
                : cartItem,
            )
          : [...items, normalizedItem];

        const error = validateItems(
          nextItems,
          get().maxTotalKg,
          get().maxItems,
          options,
        );
        if (error) return { ok: false, error };

        set({ items: nextItems });
        return { ok: true };
      },
      updateItemKg: (productId, kg, options) => {
        if (isInvalidKg(kg)) {
          return { ok: false, error: "Ingresa un valor de kg valido" };
        }

        const items = get().items.map(normalizeCartItem);
        const exists = items.some((item) => item.productId === productId);
        if (!exists) {
          return { ok: false, error: "Producto no encontrado en el pedido" };
        }

        const nextItems = items.map((item) =>
          item.productId === productId ? { ...item, kg } : item,
        );

        const error = validateItems(
          nextItems,
          get().maxTotalKg,
          get().maxItems,
          options,
        );
        if (error) return { ok: false, error };

        set({ items: nextItems });
        return { ok: true };
      },
      updateItemIsBox: (productId, isBox) => {
        const items = get().items.map(normalizeCartItem);
        const item = items.find((current) => current.productId === productId);
        if (!item) {
          return { ok: false, error: "Producto no encontrado en el pedido" };
        }
        if (isBox && !item.allowBoxes) {
          return {
            ok: false,
            error: "Este producto no permite pedidos por caja",
          };
        }

        const nextItems = items.map((current) =>
          current.productId === productId
            ? { ...current, isBox: isBox && current.allowBoxes }
            : current,
        );

        set({ items: nextItems });
        return { ok: true };
      },
      removeItem: (productId) =>
        set({
          items: get()
            .items.map(normalizeCartItem)
            .filter((item) => item.productId !== productId),
        }),
      clear: () => set({ items: [] }),
      getTotalKg: () =>
        get()
          .items.map(normalizeCartItem)
          .reduce((total, item) => total + item.kg, 0),
      getTotalPrice: () =>
        get()
          .items.map(normalizeCartItem)
          .reduce((total, item) => total + item.kg * item.price, 0),
      getTotalItems: () => get().items.length,
    }),
    {
      name: "butcher-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        maxTotalKg: state.maxTotalKg,
        maxItems: state.maxItems,
      }),
      merge: (persistedState, currentState) => {
        const typedPersisted = persistedState as
          | { items?: Partial<CartItem>[]; maxTotalKg?: number; maxItems?: number }
          | undefined;

        return {
          ...currentState,
          ...typedPersisted,
          items: (typedPersisted?.items || []).map(normalizeCartItem),
          maxTotalKg:
            Number.isFinite(typedPersisted?.maxTotalKg) &&
            Number(typedPersisted?.maxTotalKg) > 0
              ? Math.floor(Number(typedPersisted?.maxTotalKg))
              : DEFAULT_MAX_TOTAL_KG,
          maxItems:
            Number.isFinite(typedPersisted?.maxItems) &&
            Number(typedPersisted?.maxItems) > 0
              ? Math.floor(Number(typedPersisted?.maxItems))
              : DEFAULT_MAX_ITEMS,
        };
      },
    },
  ),
);
