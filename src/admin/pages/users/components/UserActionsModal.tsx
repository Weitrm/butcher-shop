import { useEffect } from "react";
import { KeyRound, Trash2, UserCheck, UserX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/interface/user.interface";

type UserActionsModalProps = {
  user: User;
  password: string;
  isUpdatingStatus: boolean;
  isUpdatingPassword: boolean;
  isDeleting: boolean;
  onPasswordChange: (value: string) => void;
  onToggleStatus: () => void;
  onUpdatePassword: () => void;
  onDelete: () => void;
  onClose: () => void;
};

// Modal con acciones de usuario: estado, contraseña y eliminación.
export const UserActionsModal = ({
  user,
  password,
  isUpdatingStatus,
  isUpdatingPassword,
  isDeleting,
  onPasswordChange,
  onToggleStatus,
  onUpdatePassword,
  onDelete,
  onClose,
}: UserActionsModalProps) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        id={`user-actions-${user.id}`}
        className="w-[420px] max-w-[calc(100%-2rem)] rounded-xl bg-white p-6 shadow-xl"
        data-user-menu="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Acciones de usuario</h3>
            <p className="text-sm text-muted-foreground">
              {user.fullName} · {user.employeeNumber}
            </p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </Button>
        </div>

        <div className="mt-5 space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor={`password-${user.id}`}>Nueva contraseña</Label>
            <Input
              id={`password-${user.id}`}
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="Solo números (6-20)"
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
