import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router";

import { useAdminUsers } from "@/admin/hooks/useAdminUsers";
import { updateUserStatusAction } from "@/admin/actions/update-user-status.action";
import { updateUserPasswordAction } from "@/admin/actions/update-user-password.action";
import { updateUserSuperUserAction } from "@/admin/actions/update-user-super-user.action";
import { deleteUserAction } from "@/admin/actions/delete-user.action";
import { registerAction } from "@/auth/actions/register.action";
import { useAuthStore } from "@/auth/store/auth.store";

import { toastAxiosError } from "../utils/toastAxiosError";
import { validateCreateUser, validatePassword } from "../utils/userValidators";

const USERS_PAGE_SIZE = 10;

// Controlador de estado y acciones para la pÃ¡gina de usuarios admin.
export const useAdminUsersController = () => {
  const [isPosting, setIsPosting] = useState(false);
  const isPostingRef = useRef(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuUserId, setOpenMenuUserId] = useState<string | null>(null);
  const [updatingStatusUserId, setUpdatingStatusUserId] = useState<string | null>(null);
  const [updatingSuperUserId, setUpdatingSuperUserId] = useState<string | null>(null);
  const [updatingPasswordUserId, setUpdatingPasswordUserId] = useState<string | null>(
    null,
  );
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useAdminUsers();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = searchParams.get("page") || "1";
  const parsedPage = Number(pageParam);
  const page = Number.isNaN(parsedPage) ? 1 : parsedPage;
  const previousQueryRef = useRef(searchQuery);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === openMenuUserId) || null,
    [openMenuUserId, users],
  );
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredUsers = useMemo(() => {
    if (!normalizedQuery) return users;
    return users.filter((user) => {
      const haystack = [
        user.fullName,
        user.employeeNumber,
        user.nationalId,
        (user.roles || []).join(" "),
        user.isSuperUser ? "super usuario" : "normal",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [users, normalizedQuery]);
  const totalPages = Math.ceil(filteredUsers.length / USERS_PAGE_SIZE);
  const paginatedUsers = useMemo(() => {
    if (!filteredUsers.length) return [];
    const maxPage = totalPages > 0 ? totalPages : 1;
    const safePage = Math.min(Math.max(page, 1), maxPage);
    const start = (safePage - 1) * USERS_PAGE_SIZE;
    return filteredUsers.slice(start, start + USERS_PAGE_SIZE);
  }, [filteredUsers, page, totalPages]);

  useEffect(() => {
    if (previousQueryRef.current === searchQuery) return;
    previousQueryRef.current = searchQuery;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", "1");
    setSearchParams(nextParams);
  }, [searchQuery, searchParams, setSearchParams]);

  useEffect(() => {
    const maxPage = totalPages > 0 ? totalPages : 1;
    const nextPage = Math.min(Math.max(page, 1), maxPage);
    if (nextPage === page) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", nextPage.toString());
    setSearchParams(nextParams);
  }, [page, totalPages, searchParams, setSearchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPostingRef.current || isPosting) return;

    const formElement = event.currentTarget;
    isPostingRef.current = true;
    setIsPosting(true);

    try {
      const formData = new FormData(formElement);
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
        return;
      }

      await registerAction(fullName, employeeNumber, nationalId, password);

      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });

      toast.success("Usuario creado correctamente");
      formElement.reset();
      setIsFormVisible(false);
    } catch (error) {
      toastAxiosError(error, "No se pudo crear el usuario");
    } finally {
      setIsPosting(false);
      isPostingRef.current = false;
    }
  };

  const handleToggleStatus = async (userId: string, nextStatus: boolean) => {
    if (updatingStatusUserId) return;
    if (currentUserId && userId === currentUserId) {
      toast.error("No puedes cambiar el estado de tu propio usuario");
      return;
    }
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
      toastAxiosError(error, "No se pudo actualizar la contraseÃ±a");
    } finally {
      setUpdatingPasswordUserId(null);
    }
  };

  const handleToggleSuperUser = async (userId: string, nextValue: boolean) => {
    if (updatingSuperUserId) return;
    setUpdatingSuperUserId(userId);

    try {
      await updateUserSuperUserAction(userId, nextValue);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(
        nextValue
          ? "Permiso de super usuario activado"
          : "Permiso de super usuario desactivado",
      );
      setOpenMenuUserId(null);
    } catch (error) {
      toastAxiosError(error, "No se pudo actualizar el permiso de super usuario");
    } finally {
      setUpdatingSuperUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (deletingUserId) return;
    if (currentUserId && userId === currentUserId) {
      toast.error("No puedes eliminar tu propio usuario");
      return;
    }
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
    filteredUsers,
    paginatedUsers,
    totalPages,
    searchQuery,
    setSearchQuery,
    isLoading,
    selectedUser,
    isPosting,
    isFormVisible,
    openMenuUserId,
    updatingStatusUserId,
    updatingSuperUserId,
    updatingPasswordUserId,
    deletingUserId,
    passwordDrafts,
    setIsFormVisible,
    setOpenMenuUserId,
    setPasswordDrafts,
    handleSubmit,
    handleToggleStatus,
    handleToggleSuperUser,
    handleUpdatePassword,
    handleDeleteUser,
  };
};















