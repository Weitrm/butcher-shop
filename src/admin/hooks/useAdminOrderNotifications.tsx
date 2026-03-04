import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getAdminOrdersAction } from "@/admin/actions/get-admin-orders.action";
import type { Order } from "@/interface/order.interface";

const STORAGE_KEY = "admin-read-order-notifications";
const NOTIFICATIONS_LIMIT = 8;
const MAX_STORED_READ_IDS = 32;

export interface AdminOrderNotification {
  id: string;
  type: "new-order";
  order: Order;
  isRead: boolean;
}

const readStoredReadIds = (): string[] | null => {
  if (typeof window === "undefined") return null;

  const storedValue = localStorage.getItem(STORAGE_KEY);
  if (!storedValue) return null;

  try {
    const parsed = JSON.parse(storedValue);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

const writeStoredReadIds = (ids: string[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
};

const sortOrdersByMostRecent = (orders: Order[]) =>
  [...orders].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

const hasSameIds = (left: string[], right: string[]) =>
  left.length === right.length && left.every((id) => right.includes(id));

export const useAdminOrderNotifications = () => {
  const [readIds, setReadIds] = useState<string[]>(() => readStoredReadIds() || []);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-order-notifications"],
    queryFn: () => getAdminOrdersAction({ limit: NOTIFICATIONS_LIMIT, offset: 0 }),
    staleTime: 1000 * 10,
    refetchInterval: 1000 * 20,
  });

  const recentOrders = useMemo(
    () => sortOrdersByMostRecent(data?.orders || []).slice(0, NOTIFICATIONS_LIMIT),
    [data?.orders],
  );

  const notifications = useMemo<AdminOrderNotification[]>(
    () =>
      recentOrders.map((order) => ({
        id: order.id,
        type: "new-order",
        order,
        isRead: readIds.includes(order.id),
      })),
    [readIds, recentOrders],
  );

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const latestOrder = notifications[0]?.order ?? null;

  const markOneAsRead = useCallback(
    (notificationId: string) => {
      if (readIds.includes(notificationId)) return;

      const nextReadIds = [notificationId, ...readIds].slice(0, MAX_STORED_READ_IDS);
      writeStoredReadIds(nextReadIds);
      setReadIds(nextReadIds);
    },
    [readIds],
  );

  const markAllAsRead = useCallback(() => {
    const visibleIds = recentOrders.map((order) => order.id);
    const nextReadIds = [
      ...visibleIds,
      ...readIds.filter((id) => !visibleIds.includes(id)),
    ].slice(0, MAX_STORED_READ_IDS);

    if (hasSameIds(readIds, nextReadIds)) return;

    writeStoredReadIds(nextReadIds);
    setReadIds(nextReadIds);
  }, [readIds, recentOrders]);

  return {
    notifications,
    latestOrder,
    hasNewOrder: unreadCount > 0,
    unreadCount,
    markOneAsRead,
    markAllAsRead,
    isLoading,
    isFetching,
    refetch,
  };
};
