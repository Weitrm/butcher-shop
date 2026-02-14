import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { useAdminUsers } from "@/admin/hooks/useAdminUsers";
import { updateUserStatusAction } from "@/admin/actions/update-user-status.action";
import { updateUserPasswordAction } from "@/admin/actions/update-user-password.action";
import { deleteUserAction } from "@/admin/actions/delete-user.action";
import { registerAction } from "@/auth/actions/register.action";

import { toastAxiosError } from "../utils/toastAxiosError";
import { validateCreateUser, validatePassword } from "../utils/userValidators";

export const useAdminUsersController = () => {
  const [isPosting, setIsPosting] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);
  const [updatingStatusUserId, setUpdatingStatusUserId] = useState<string | null>(null);
  const [updatingPasswordUserId, setUpdatingPasswordUserId] = useState<string | null>(
    null,
  );
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useAdminUsers();

  const selectedUser = useMemo(
    () => users.find((user) => user.id === openMenuUserId) || null,
    [openMenuUserId, users],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPosting) return;

    setIsPosting(true);

    const formData = new FormData(event.currentTarget);
    const fullName = (formData.get("fullName") as string) || "";
    const employeeNumber = (formData.get("employeeNumber") as string) || "";
    const nationalId = (formData.get("nationalId") as string) || "";
    const password = (formData.get("password") as string) || "";

    const errorMessage = validateCreateUser(
      fullName,
      employeeNumber,
      nationalId,
      password,
    );
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
      toastAxiosError(error, "No se pudo crear el usuario");
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
      toastAxiosError(error, "No se pudo actualizar el usuario");
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
      toastAxiosError(error, "No se pudo actualizar la contraseña");
    } finally {
      setUpdatingPasswordUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (deletingUserId) return;
    const confirmed = window.confirm("¿Eliminar usuario? Esta acción no se puede deshacer.");
    if (!confirmed) return;

    setDeletingUserId(userId);
    try {
      await deleteUserAction(userId);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Usuario eliminado correctamente");
      setOpenMenuUserId(null);
    } catch (error) {
      toastAxiosError(error, "No se pudo eliminar el usuario");
    } finally {
      setDeletingUserId(null);
    }
  };

  return {
    users,
    isLoading,
    selectedUser,
    isPosting,
    isFormVisible,
    openMenuUserId,
    updatingStatusUserId,
    updatingPasswordUserId,
    deletingUserId,
    passwordDrafts,
    setIsFormVisible,
    setOpenMenuUserId,
    setPasswordDrafts,
    handleSubmit,
    handleToggleStatus,
    handleUpdatePassword,
    handleDeleteUser,
  };
};
