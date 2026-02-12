import { useState, type FormEvent } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AdminTitle } from "@/admin/components/AdminTitle";
import { useAdminUsers } from "@/admin/hooks/useAdminUsers";
import { registerAction } from "@/auth/actions/register.action";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const AdminUsersPage = () => {
  const [isPosting, setIsPosting] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useAdminUsers();

  const validateForm = (
    fullName: string,
    employeeNumber: string,
    nationalId: string,
    password: string,
  ) => {
    if (!fullName.trim()) return "El nombre completo es requerido";
    if (!employeeNumber.trim()) return "El número de funcionario es requerido";
    if (!nationalId.trim()) return "La cédula es requerida";
    if (!password) return "La contraseña es requerida";
    if (!/^\d+$/.test(password)) return "La contraseña debe contener solo números";
    if (password.length < 6) return "La contraseña debe tener al menos 6 números";
    if (password.length > 20) return "La contraseña no puede superar 20 números";
    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPosting) return;

    setIsPosting(true);

    const formData = new FormData(event.currentTarget);
    const fullName = (formData.get("fullName") as string) || "";
    const employeeNumber = (formData.get("employeeNumber") as string) || "";
    const nationalId = (formData.get("nationalId") as string) || "";
    const password = (formData.get("password") as string) || "";

    const errorMessage = validateForm(fullName, employeeNumber, nationalId, password);
    if (errorMessage) {
      toast.error(errorMessage);
      setIsPosting(false);
      return;
    }

    try {
      await registerAction(fullName, employeeNumber, nationalId, password);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Usuario creado correctamente");
      event.currentTarget.reset();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        const normalizedMessage = Array.isArray(message) ? message.join(", ") : message;
        toast.error(normalizedMessage || "No se pudo crear el usuario");
      } else {
        toast.error("No se pudo crear el usuario");
      }
    } finally {
      setIsPosting(false);
    }
  };

  if (isLoading) {
    return <CustomFullScreenLoading />;
  }

  return (
    <>
      <AdminTitle title="Usuarios" subtitle="Crear usuarios desde el panel" />

      <div className="mb-4 flex justify-end">
        <Button type="button" onClick={() => setIsFormVisible((prev) => !prev)}>
          {isFormVisible ? "Ocultar formulario" : "Nuevo usuario"}
        </Button>
      </div>

      {isFormVisible && (
        <Card className="max-w-2xl">
          <CardContent className="p-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Nombre completo"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="employeeNumber">Número de funcionario</Label>
                <Input
                  id="employeeNumber"
                  name="employeeNumber"
                  type="text"
                  placeholder="Ej: 1024"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nationalId">Cédula</Label>
                <Input
                  id="nationalId"
                  name="nationalId"
                  type="text"
                  placeholder="Ej: 12345678"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Contraseña"
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isPosting}>
                  {isPosting ? "Creando..." : "Crear usuario"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-gray-500">
                    No hay usuarios registrados.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.employeeNumber}</TableCell>
                    <TableCell>{user.nationalId}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {(user.roles || []).join(", ")}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          user.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};
