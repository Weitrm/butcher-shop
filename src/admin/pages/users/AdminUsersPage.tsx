import { useState, type FormEvent } from "react";
import axios from "axios";
import { useEffect } from "react";
import { ChevronUp, KeyRound, Settings, Trash2, UserCheck, UserPlus, UserX } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AdminTitle } from "@/admin/components/AdminTitle";
import { useAdminUsers } from "@/admin/hooks/useAdminUsers";
import { updateUserStatusAction } from "@/admin/actions/update-user-status.action";
import { updateUserPasswordAction } from "@/admin/actions/update-user-password.action";
import { deleteUserAction } from "@/admin/actions/delete-user.action";
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
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);
  const [updatingStatusUserId, setUpdatingStatusUserId] = useState<string | null>(null);
  const [updatingPasswordUserId, setUpdatingPasswordUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});
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

  const validatePassword = (password: string) => {
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
      setIsFormVisible(false);
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

  const handleToggleStatus = async (userId: string, nextStatus: boolean) => {
    if (updatingStatusUserId) return;
    setUpdatingStatusUserId(userId);

    try {
      await updateUserStatusAction(userId, nextStatus);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(
        nextStatus ? "Usuario activado correctamente" : "Usuario desactivado correctamente",
      );
      setOpenMenuUserId(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        const normalizedMessage = Array.isArray(message) ? message.join(", ") : message;
        toast.error(normalizedMessage || "No se pudo actualizar el usuario");
      } else {
        toast.error("No se pudo actualizar el usuario");
      }
    } finally {
      setUpdatingStatusUserId(null);
    }
  };

  const handleUpdatePassword = async (userId: string) => {
    if (updatingPasswordUserId) return;
    const password = passwordDrafts[userId] || "";
    const errorMessage = validatePassword(password);
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    setUpdatingPasswordUserId(userId);
    try {
      await updateUserPasswordAction(userId, password);
      toast.success("Contraseña actualizada correctamente");
      setPasswordDrafts((prev) => ({ ...prev, [userId]: "" }));
      setOpenMenuUserId(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        const normalizedMessage = Array.isArray(message) ? message.join(", ") : message;
        toast.error(normalizedMessage || "No se pudo actualizar la contraseña");
      } else {
        toast.error("No se pudo actualizar la contraseña");
      }
    } finally {
      setUpdatingPasswordUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (deletingUserId) return;
    const confirmed = window.confirm(
      "¿Eliminar usuario? Esta acción no se puede deshacer.",
    );
    if (!confirmed) return;

    setDeletingUserId(userId);
    try {
      await deleteUserAction(userId);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Usuario eliminado correctamente");
      setOpenMenuUserId(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        const normalizedMessage = Array.isArray(message) ? message.join(", ") : message;
        toast.error(normalizedMessage || "No se pudo eliminar el usuario");
      } else {
        toast.error("No se pudo eliminar el usuario");
      }
    } finally {
      setDeletingUserId(null);
    }
  };

  useEffect(() => {
    if (!openMenuUserId) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenuUserId(null);
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [openMenuUserId]);

  const selectedUser = users.find((user) => user.id === openMenuUserId) || null;

  if (isLoading) {
    return <CustomFullScreenLoading />;
  }

  return (
    <>
      <AdminTitle title="Usuarios" subtitle="Crear usuarios desde el panel" />

      <div className="mb-4 flex justify-start">
        <Button
          type="button"
          onClick={() => setIsFormVisible((prev) => !prev)}
          aria-expanded={isFormVisible}
          aria-controls="admin-user-form"
          className="gap-2"
        >
          {isFormVisible ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Ocultar formulario
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Nuevo usuario
            </>
          )}
        </Button>
      </div>

      <div
        id="admin-user-form"
        aria-hidden={!isFormVisible}
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isFormVisible
            ? "max-h-[800px] opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <Card className="max-w-2xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              <fieldset disabled={!isFormVisible} className="space-y-5">
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
              </fieldset>
            </form>
          </CardContent>
        </Card>
      </div>

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
                    <TableCell className="align-top">
                      <div className="flex justify-center">
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="h-9 w-9 bg-blue-500 text-white hover:bg-blue-600"
                          onClick={() => setOpenMenuUserId(user.id)}
                          aria-expanded={openMenuUserId === user.id}
                          aria-controls={`user-actions-${user.id}`}
                          aria-label={`Acciones para ${user.fullName}`}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {openMenuUserId && selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpenMenuUserId(null)}
        >
          <div
            id={`user-actions-${selectedUser.id}`}
            className="w-[420px] max-w-[calc(100%-2rem)] rounded-xl bg-white p-6 shadow-xl"
            data-user-menu="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Acciones de usuario</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedUser.fullName} · {selectedUser.employeeNumber}
                </p>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setOpenMenuUserId(null)}
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
                disabled={updatingStatusUserId === selectedUser.id}
                onClick={() => handleToggleStatus(selectedUser.id, !selectedUser.isActive)}
              >
                {selectedUser.isActive ? (
                  <UserX className="h-4 w-4" />
                ) : (
                  <UserCheck className="h-4 w-4" />
                )}
                {updatingStatusUserId === selectedUser.id
                  ? "Actualizando..."
                  : selectedUser.isActive
                    ? "Desactivar usuario"
                    : "Activar usuario"}
              </Button>

              <div className="space-y-2">
                <Label htmlFor={`password-${selectedUser.id}`}>Nueva contraseña</Label>
                <Input
                  id={`password-${selectedUser.id}`}
                  type="password"
                  value={passwordDrafts[selectedUser.id] || ""}
                  onChange={(event) =>
                    setPasswordDrafts((prev) => ({
                      ...prev,
                      [selectedUser.id]: event.target.value,
                    }))
                  }
                  placeholder="Solo números (6-20)"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  disabled={updatingPasswordUserId === selectedUser.id}
                  onClick={() => handleUpdatePassword(selectedUser.id)}
                >
                  <KeyRound className="h-4 w-4" />
                  {updatingPasswordUserId === selectedUser.id
                    ? "Actualizando..."
                    : "Actualizar contraseña"}
                </Button>
              </div>

              <Button
                type="button"
                variant="destructive"
                className="w-full justify-start"
                disabled={deletingUserId === selectedUser.id}
                onClick={() => handleDeleteUser(selectedUser.id)}
              >
                <Trash2 className="h-4 w-4" />
                {deletingUserId === selectedUser.id
                  ? "Eliminando..."
                  : "Eliminar usuario"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
