import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminOrdersAction } from "@/admin/actions/get-admin-orders.action";
import type { Order } from "@/interface/order.interface";

const STORAGE_KEY = "admin-last-seen-order";

const readStoredLastSeen = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
};

const writeStoredLastSeen = (value: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, value);
};

const getLatestOrder = (orders: Order[]) => {
  if (orders.length === 0) return null;
  return orders.reduce((latest, current) => {
    const latestTime = new Date(latest.createdAt).getTime();
    const currentTime = new Date(current.createdAt).getTime();
    return currentTime > latestTime ? current : latest;
  }, orders[0]);
};

export const useAdminOrderNotifications = () => {
  const [lastSeenId, setLastSeenId] = useState<string | null>(() => readStoredLastSeen());

  const { data, isLoading } = useQuery({
    queryKey: ["admin-latest-order"],
    queryFn: () => getAdminOrdersAction({ limit: 5, offset: 0 }),
    staleTime: 1000 * 10,
    refetchInterval: 1000 * 20,
  });

  const latestOrder = useMemo(
    () => getLatestOrder(data?.orders || []),
    [data?.orders],
  );

  const hasNewOrder = Boolean(latestOrder && lastSeenId && latestOrder.id !== lastSeenId);

  useEffect(() => {
    if (!latestOrder) return;
    if (lastSeenId) return;
    writeStoredLastSeen(latestOrder.id);
    setLastSeenId(latestOrder.id);
  }, [latestOrder, lastSeenId]);

  const markAsRead = useCallback(() => {
    if (!latestOrder) return;
    writeStoredLastSeen(latestOrder.id);
    setLastSeenId(latestOrder.id);
  }, [latestOrder]);

  return {
    latestOrder,
    hasNewOrder,
    markAsRead,
    isLoading,
  };
};
