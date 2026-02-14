import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import type { User } from "@/interface/user.interface";

import { UserStatusBadge } from "./UserStatusBadge";

type UserRowProps = {
  user: User;
  isMenuOpen: boolean;
  onOpenActions: (userId: string) => void;
};

export const UserRow = ({ user, isMenuOpen, onOpenActions }: UserRowProps) => (
  <TableRow>
    <TableCell className="font-medium">{user.fullName}</TableCell>
    <TableCell>{user.employeeNumber}</TableCell>
    <TableCell>{user.nationalId}</TableCell>
    <TableCell className="text-sm text-gray-600">
      {(user.roles || []).join(", ")}
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
