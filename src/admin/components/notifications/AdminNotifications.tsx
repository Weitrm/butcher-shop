import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LatestOrderPreview } from "@/admin/components/notifications/LatestOrderPreview";
import { useAdminOrderNotifications } from "@/admin/hooks/useAdminOrderNotifications";

export const AdminNotifications = () => {
  const { latestOrder, hasNewOrder, markAsRead, isLoading } = useAdminOrderNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleToggleMenu = () => {
    setIsOpen((open) => !open);
  };

  useEffect(() => {
    if (!isOpen) return;
    markAsRead();
  }, [isOpen, markAsRead]);

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
        {hasNewOrder && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg z-20">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-[11px] uppercase tracking-wide text-gray-400">
              Notificaciones
            </p>
            <p className="text-sm font-semibold text-gray-900">Ultimo pedido</p>
          </div>
          <LatestOrderPreview order={latestOrder} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
};
