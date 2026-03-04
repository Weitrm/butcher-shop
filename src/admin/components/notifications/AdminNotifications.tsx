import { Bell } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";

import { OrderNotificationItem } from "@/admin/components/notifications/OrderNotificationItem";
import { useAdminOrderNotifications } from "@/admin/hooks/useAdminOrderNotifications";

type NotificationFilter = "all" | "unread" | "read";

export const AdminNotifications = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const menuRef = useRef<HTMLDivElement>(null);
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
