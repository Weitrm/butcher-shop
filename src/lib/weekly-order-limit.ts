import type { User } from "@/interface/user.interface";

const toPositiveIntOrNull = (value?: number | null) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return null;
  return Math.floor(parsed);
};

export const getStartOfWeekSunday = (reference = new Date()) => {
  const start = new Date(reference);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start;
};

export const getBaseWeeklyOrderLimit = (user?: User | null) => {
  return toPositiveIntOrNull(user?.sector?.maxOrdersPerWeek);
};

export const getCurrentWeekExtraOrders = (user?: User | null) =>
  toPositiveIntOrNull(user?.currentWeekExtraOrders) ?? 0;

export const getEffectiveWeeklyOrderLimit = (user?: User | null) => {
  const baseLimit = getBaseWeeklyOrderLimit(user);
  if (baseLimit === null) return null;
  return baseLimit + getCurrentWeekExtraOrders(user);
};

export const formatWeeklyOrdersLabel = (count: number) =>
  `${count} pedido${count === 1 ? "" : "s"}`;
