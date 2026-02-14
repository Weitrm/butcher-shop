import { Search, X } from "lucide-react";

import { AdminTitle } from "@/admin/components/AdminTitle";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { CreateUserFormCard } from "./components/CreateUserFormCard";
import { CreateUserToggle } from "./components/CreateUserToggle";
import { UserActionsModal } from "./components/UserActionsModal";
import { UsersTable } from "./components/UsersTable";
import { useAdminUsersController } from "./hooks/useAdminUsersController";

export const AdminUsersPage = () => {
  const {
    filteredUsers,
    searchQuery,
    setSearchQuery,
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
  } = useAdminUsersController();

  const hasSearch = searchQuery.trim().length > 0;
  const emptyMessage = hasSearch
    ? "No hay usuarios que coincidan con la búsqueda."
    : "No hay usuarios registrados.";

  if (isLoading) {
    return <CustomFullScreenLoading />;
  }

  return (
    <>
      <AdminTitle title="Usuarios" subtitle="Crear usuarios desde el panel" />

      <div className="mb-4 flex justify-start">
        <CreateUserToggle
          isOpen={isFormVisible}
          onToggle={() => setIsFormVisible((prev) => !prev)}
        />
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                Buscar usuario
              </label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Nombre, funcionario, cédula o rol"
                  className="pl-9"
                />
              </div>
            </div>
            {hasSearch && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                <X className="h-4 w-4" />
                Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <CreateUserFormCard
        isVisible={isFormVisible}
        isSubmitting={isPosting}
        onSubmit={handleSubmit}
        onClose={() => setIsFormVisible(false)}
      />

      <UsersTable
        users={filteredUsers}
        openMenuUserId={openMenuUserId}
        onOpenActions={(userId) => setOpenMenuUserId(userId)}
        emptyMessage={emptyMessage}
      />

      {openMenuUserId && selectedUser && (
        <UserActionsModal
          user={selectedUser}
          password={passwordDrafts[selectedUser.id] || ""}
          isUpdatingStatus={updatingStatusUserId === selectedUser.id}
          isUpdatingPassword={updatingPasswordUserId === selectedUser.id}
          isDeleting={deletingUserId === selectedUser.id}
          onPasswordChange={(value) =>
            setPasswordDrafts((prev) => ({ ...prev, [selectedUser.id]: value }))
          }
          onToggleStatus={() => handleToggleStatus(selectedUser.id, !selectedUser.isActive)}
          onUpdatePassword={() => handleUpdatePassword(selectedUser.id)}
          onDelete={() => handleDeleteUser(selectedUser.id)}
          onClose={() => setOpenMenuUserId(null)}
        />
      )}
    </>
  );
};







