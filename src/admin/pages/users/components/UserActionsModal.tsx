import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  KeyRound,
  Shield,
  ShieldCheck,
  TicketPlus,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";

import { SectorBadge } from "@/components/custom/SectorBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Sector } from "@/interface/sector.interface";
import type { User } from "@/interface/user.interface";
import { hasAdminRole, hasSuperUserRole } from "@/lib/user-roles";
import {
  formatWeeklyOrdersLabel,
  getBaseWeeklyOrderLimit,
  getCurrentWeekExtraOrders,
  getEffectiveWeeklyOrderLimit,
} from "@/lib/weekly-order-limit";

type UserActionsModalProps = {
  user: User;
  sectors: Sector[];
  selectedSectorId: string;
  password: string;
  isUpdatingStatus: boolean;
  isUpdatingAdmin: boolean;
  isUpdatingSuperUser: boolean;
  isUpdatingSector: boolean;
  isGrantingWeeklyExtraOrders: boolean;
  isUpdatingPassword: boolean;
  isDeleting: boolean;
  onPasswordChange: (value: string) => void;
  onSectorChange: (value: string) => void;
  onToggleStatus: () => void;
  onToggleAdmin: () => void;
  onToggleSuperUser: () => void;
  onUpdateSector: () => void;
  onGrantWeeklyExtraOrder: () => void;
  onUpdatePassword: () => void;
  onDelete: () => void;
  onClose: () => void;
};

export const UserActionsModal = ({
  user,
  sectors,
  selectedSectorId,
  password,
  isUpdatingStatus,
  isUpdatingAdmin,
  isUpdatingSuperUser,
  isUpdatingSector,
  isGrantingWeeklyExtraOrders,
  isUpdatingPassword,
  isDeleting,
  onPasswordChange,
  onSectorChange,
  onToggleStatus,
  onToggleAdmin,
  onToggleSuperUser,
  onUpdateSector,
  onGrantWeeklyExtraOrder,
  onUpdatePassword,
  onDelete,
  onClose,
}: UserActionsModalProps) => {
  const [isWeeklyControlsOpen, setIsWeeklyControlsOpen] = useState(false);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const hasSuperRole = hasSuperUserRole(user);
  const isAdmin = hasAdminRole(user);
  const selectedSector =
    sectors.find((sector) => sector.id === selectedSectorId) ||
    (user.sectorId ? sectors.find((sector) => sector.id === user.sectorId) : undefined);
  const baseWeeklyLimit = getBaseWeeklyOrderLimit(user);
  const currentWeekExtraOrders = getCurrentWeekExtraOrders(user);
  const effectiveWeeklyOrderLimit = getEffectiveWeeklyOrderLimit(user);
  const currentWeekOrdersCount = Math.max(0, Number(user.currentWeekOrdersCount || 0));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        id={`user-actions-${user.id}`}
        className="w-[460px] max-w-[calc(100%-2rem)] rounded-xl bg-white p-6 shadow-xl"
        data-user-menu="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Acciones de usuario</h3>
            <p className="text-sm text-muted-foreground">
              {user.fullName} - {user.employeeNumber}
            </p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onClose}
            aria-label="Cerrar"
          >
            x
          </Button>
        </div>

        <div className="mt-5 space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
            disabled={isUpdatingAdmin}
            onClick={onToggleAdmin}
          >
            <Shield className="h-4 w-4" />
            {isUpdatingAdmin
              ? "Actualizando..."
              : isAdmin
              ? "Quitar admin"
              : "Hacer admin"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
            disabled={isUpdatingStatus}
            onClick={onToggleStatus}
          >
            {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
            {isUpdatingStatus
              ? "Actualizando..."
              : user.isActive
              ? "Desactivar usuario"
              : "Activar usuario"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
            disabled={isUpdatingSuperUser}
            onClick={onToggleSuperUser}
          >
            <ShieldCheck className="h-4 w-4" />
            {isUpdatingSuperUser
              ? "Actualizando..."
              : hasSuperRole
              ? "Quitar super usuario"
              : "Hacer super usuario"}
          </Button>

          <div className="space-y-2">
            <Label htmlFor={`sector-${user.id}`}>Sector</Label>
            <select
              id={`sector-${user.id}`}
              value={selectedSectorId}
              onChange={(event) => onSectorChange(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Sin sector</option>
              {sectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.title}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
              disabled={isUpdatingSector}
              onClick={onUpdateSector}
            >
              {isUpdatingSector ? "Actualizando..." : "Actualizar sector"}
            </Button>
            <div>
              <SectorBadge
                title={selectedSector?.title || (selectedSectorId ? "Sector seleccionado" : null)}
                color={selectedSector?.color}
                fallback="Sin sector"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between"
              onClick={() => setIsWeeklyControlsOpen((prev) => !prev)}
            >
              <span className="flex items-center gap-2">
                <TicketPlus className="h-4 w-4" />
                Gestionar limite semanal
              </span>
              {isWeeklyControlsOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {isWeeklyControlsOpen && (
              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="space-y-1 text-sm text-slate-700">
                  <p>
                    Base sector:{" "}
                    {baseWeeklyLimit === null
                      ? "Sin limite"
                      : formatWeeklyOrdersLabel(baseWeeklyLimit)}
                  </p>
                  <p>
                    Limite efectivo:{" "}
                    {effectiveWeeklyOrderLimit === null
                      ? "Sin limite"
                      : formatWeeklyOrdersLabel(effectiveWeeklyOrderLimit)}
                  </p>
                  <p>Extras esta semana: +{currentWeekExtraOrders}</p>
                  <p>Pedidos usados esta semana: {currentWeekOrdersCount}</p>
                </div>

                <Button
                  type="button"
                  className="w-full justify-start"
                  disabled={isGrantingWeeklyExtraOrders}
                  onClick={onGrantWeeklyExtraOrder}
                >
                  <TicketPlus className="h-4 w-4" />
                  {isGrantingWeeklyExtraOrders
                    ? "Agregando..."
                    : "Agregar 1 pedido extra esta semana"}
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`password-${user.id}`}>Nueva contraseña</Label>
            <Input
              id={`password-${user.id}`}
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="Solo numeros (6-20)"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
              disabled={isUpdatingPassword}
              onClick={onUpdatePassword}
            >
              <KeyRound className="h-4 w-4" />
              {isUpdatingPassword ? "Actualizando..." : "Actualizar contraseña"}
            </Button>
          </div>

          <Button
            type="button"
            variant="destructive"
            className="w-full justify-start"
            disabled={isDeleting}
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Eliminando..." : "Eliminar usuario"}
          </Button>
        </div>
      </div>
    </div>
  );
};
