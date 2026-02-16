import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { User } from "@/interface/user.interface";

import { UserRow } from "./UserRow";

type UsersTableProps = {
  users: User[];
  openMenuUserId: string | null;
  onOpenActions: (userId: string) => void;
  emptyMessage?: string;
};

// Tabla para listar usuarios y abrir el menÃº de acciones.
export const UsersTable = ({
  users,
  openMenuUserId,
  onOpenActions,
  emptyMessage,
}: UsersTableProps) => (
  <Card className="mt-6">
    <CardContent className="p-0">
      <Table className="bg-white">
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Funcionario</TableHead>
            <TableHead>Cédula</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-sm text-gray-500">
                {emptyMessage ?? "No hay usuarios registrados."}
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                isMenuOpen={openMenuUserId === user.id}
                onOpenActions={onOpenActions}
              />
            ))
          )}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);



