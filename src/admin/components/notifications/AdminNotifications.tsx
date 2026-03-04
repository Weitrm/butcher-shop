import { Bell } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { OrderNotificationItem } from "@/admin/components/notifications/OrderNotificationItem";
import { useAdminOrderNotifications } from "@/admin/hooks/useAdminOrderNotifications";

type NotificationFilter = "all" | "unread" | "read";
type BrowserNotificationPermission = NotificationPermission | "unsupported";

const BROWSER_NOTIFIED_STORAGE_KEY = "admin-browser-notified-order-notifications";
const MAX_BROWSER_NOTIFIED_IDS = 32;

const getBrowserNotificationPermission = (): BrowserNotificationPermission => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return window.Notification.permission;
};

const readBrowserNotifiedIds = (): string[] => {
  if (typeof window === "undefined") return [];

  const storedValue = localStorage.getItem(BROWSER_NOTIFIED_STORAGE_KEY);
  if (!storedValue) return [];

  try {
    const parsed = JSON.parse(storedValue);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    localStorage.removeItem(BROWSER_NOTIFIED_STORAGE_KEY);
    return [];
  }
};

const writeBrowserNotifiedIds = (ids: string[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(BROWSER_NOTIFIED_STORAGE_KEY, JSON.stringify(ids));
};

export const AdminNotifications = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [browserPermission, setBrowserPermission] = useState<BrowserNotificationPermission>(
    () => getBrowserNotificationPermission(),
  );
  const [isPageHidden, setIsPageHidden] = useState(
    () => (typeof document !== "undefined" ? document.hidden : false),
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const hasInitializedBrowserNotificationsRef = useRef(false);
  const browserNotifiedIdsRef = useRef<string[]>(readBrowserNotifiedIds());
  const {
    notifications,
    unreadCount,
    markOneAsRead,
    markAllAsRead,
    isLoading,
    isFetching,
  } = useAdminOrderNotifications();

  const handleToggleMenu = () => {
    setIsOpen((open) => !open);
  };

  const handleEnableBrowserNotifications = async () => {
    if (browserPermission === "unsupported" || browserPermission === "granted") return;

    const permission = await window.Notification.requestPermission();
    setBrowserPermission(permission);
  };

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((notification) => !notification.isRead);
    }

    if (filter === "read") {
      return notifications.filter((notification) => notification.isRead);
    }

    return notifications;
  }, [filter, notifications]);

  const handleOpenOrders = () => {
    setIsOpen(false);
    navigate("/admin/orders");
  };

  const handleOpenNotification = (notificationId: string, searchTerm?: string | null) => {
    markOneAsRead(notificationId);
    setIsOpen(false);

    if (!searchTerm) {
      navigate("/admin/orders");
      return;
    }

    const nextParams = new URLSearchParams();
    nextParams.set("user", searchTerm);
    navigate(`/admin/orders?${nextParams.toString()}`);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageHidden(document.hidden);
      setBrowserPermission(getBrowserNotificationPermission());
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    const visibleIds = notifications.map((notification) => notification.id);
    const prunedIds = browserNotifiedIdsRef.current.filter((id) => visibleIds.includes(id));

    if (prunedIds.length !== browserNotifiedIdsRef.current.length) {
      browserNotifiedIdsRef.current = prunedIds;
      writeBrowserNotifiedIds(prunedIds);
    }

    if (!hasInitializedBrowserNotificationsRef.current) {
      const baselineIds = visibleIds.slice(0, MAX_BROWSER_NOTIFIED_IDS);
      browserNotifiedIdsRef.current = baselineIds;
      writeBrowserNotifiedIds(baselineIds);
      hasInitializedBrowserNotificationsRef.current = true;
      return;
    }

    if (browserPermission !== "granted" || !isPageHidden) return;

    const unseenUnreadNotifications = notifications.filter(
      (notification) =>
        !notification.isRead && !browserNotifiedIdsRef.current.includes(notification.id),
    );

    if (unseenUnreadNotifications.length === 0) return;

    const nextNotifiedIds = [
      ...unseenUnreadNotifications.map((notification) => notification.id),
      ...browserNotifiedIdsRef.current,
    ].slice(0, MAX_BROWSER_NOTIFIED_IDS);

    browserNotifiedIdsRef.current = nextNotifiedIds;
    writeBrowserNotifiedIds(nextNotifiedIds);

    const latestNotification = unseenUnreadNotifications[0];
    const latestOrder = latestNotification.order;
    const latestUserLabel = latestOrder.user?.employeeNumber
      ? `Func. ${latestOrder.user.employeeNumber}`
      : latestOrder.user?.fullName || "Cliente";

    const browserNotification =
      unseenUnreadNotifications.length === 1
        ? new window.Notification("Nuevo pedido recibido", {
            body: `${latestUserLabel} hizo un pedido nuevo.`,
            tag: `admin-order-${latestNotification.id}`,
          })
        : new window.Notification(`Tenes ${unseenUnreadNotifications.length} pedidos nuevos`, {
            body: "Abri el panel de admin para revisar los pedidos pendientes.",
            tag: "admin-orders-summary",
          });

    browserNotification.onclick = () => {
      window.focus();
      navigate("/admin/orders");
      browserNotification.close();
    };
  }, [browserPermission, isPageHidden, navigate, notifications]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={handleToggleMenu}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Notificaciones"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-2 w-96 rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-400">
                  Notificaciones
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {unreadCount > 0 ? `${unreadCount} nuevas` : "Sin novedades"}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
                >
                  Marcar todas
                </button>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2">
              {(["all", "unread", "read"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    filter === option
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {option === "all"
                    ? "Todas"
                    : option === "unread"
                      ? "No leidas"
                      : "Leidas"}
                </button>
              ))}
            </div>
            {browserPermission !== "granted" && (
              <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
                {browserPermission === "default" ? (
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-blue-800">
                      Activa alertas del navegador para recibir avisos con la pestaña en segundo
                      plano.
                    </p>
                    <button
                      type="button"
                      onClick={handleEnableBrowserNotifications}
                      className="shrink-0 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      Activar
                    </button>
                  </div>
                ) : browserPermission === "denied" ? (
                  <p className="text-xs text-blue-800">
                    Las alertas del navegador estan bloqueadas. Habilitalas desde el navegador si
                    quieres avisos en segundo plano.
                  </p>
                ) : (
                  <p className="text-xs text-blue-800">
                    Tu navegador no soporta alertas del sistema.
                  </p>
                )}
              </div>
            )}
            {browserPermission === "granted" && (
              <p className="mt-3 text-xs text-gray-500">
                Alertas del navegador activas para cuando la pestaña quede en segundo plano.
              </p>
            )}
          </div>

          <div className="max-h-[26rem] space-y-3 overflow-y-auto px-4 py-3">
            {isLoading && notifications.length === 0 ? (
              <p className="text-sm text-gray-500">Cargando notificaciones...</p>
            ) : filteredNotifications.length === 0 ? (
              <p className="text-sm text-gray-500">
                {filter === "all"
                  ? "No hay pedidos recientes."
                  : filter === "unread"
                    ? "No hay notificaciones sin leer."
                    : "No hay notificaciones leidas."}
              </p>
            ) : (
              filteredNotifications.map((notification) => (
                <OrderNotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markOneAsRead}
                  onOpenOrder={(selectedNotification) =>
                    handleOpenNotification(
                      selectedNotification.id,
                      selectedNotification.order.user?.employeeNumber ||
                        selectedNotification.order.user?.fullName,
                    )
                  }
                />
              ))
            )}
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <button
              type="button"
              onClick={handleOpenOrders}
              className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
            >
              Ver pedidos
            </button>
            {isFetching && (
              <p className="text-xs text-gray-400">
                Actualizando...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
