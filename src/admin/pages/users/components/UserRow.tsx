import { Settings } from "lucide-react";

import { SectorBadge } from "@/components/custom/SectorBadge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import type { User } from "@/interface/user.interface";
import { hasSuperUserRole } from "@/lib/user-roles";

import { UserStatusBadge } from "./UserStatusBadge";

type UserRowProps = {
  user: User;
  isMenuOpen: boolean;
  onOpenActions: (userId: string) => void;
};

// Fila individual de usuario con disparador de acciones.
export const UserRow = ({ user, isMenuOpen, onOpenActions }: UserRowProps) => {
  const hasSuperRole = hasSuperUserRole(user);
  const normalizedRoles = new Set(user.roles || []);
  if (hasSuperRole) {
    normalizedRoles.add("super-user");
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{user.fullName}</TableCell>
      <TableCell>{user.employeeNumber}</TableCell>
      <TableCell>{user.nationalId}</TableCell>
      <TableCell>
        <SectorBadge title={user.sector?.title} color={user.sector?.color} />
      </TableCell>
      <TableCell className="text-sm text-gray-600">
        {Array.from(normalizedRoles).join(", ") || "user"}
      </TableCell>
      <TableCell>
        <UserStatusBadge isActive={user.isActive} />
      </TableCell>
      <TableCell className="align-top">
        <div className="flex justify-center">
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="h-9 w-9 bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => onOpenActions(user.id)}
            aria-expanded={isMenuOpen}
            aria-controls={`user-actions-${user.id}`}
            aria-label={`Acciones para ${user.fullName}`}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
