import { Search, X } from "lucide-react";

import { AdminTitle } from "@/admin/components/AdminTitle";
import { SectorBadge } from "@/components/custom/SectorBadge";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { CustomPagination } from "@/components/custom/CustomPagination";
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
    sectors,
    paginatedUsers,
    totalPages,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    sectorFilter,
    setSectorFilter,
    isLoading,
    selectedUser,
    selectedSectorIdForModal,
    isPosting,
    isFormVisible,
    openMenuUserId,
    updatingStatusUserId,
    updatingSuperUserId,
    updatingSectorUserId,
    updatingPasswordUserId,
    deletingUserId,
    passwordDrafts,
    setIsFormVisible,
    setOpenMenuUserId,
    setPasswordDrafts,
    setSectorDrafts,
    handleSubmit,
    handleToggleStatus,
    handleToggleSuperUser,
    handleUpdateSector,
    handleUpdatePassword,
    handleDeleteUser,
  } = useAdminUsersController();

  const hasSearch = searchQuery.trim().length > 0;
  const hasAdvancedFilters = roleFilter !== "all" || sectorFilter !== "all";
  const selectedSector = sectors.find((sector) => sector.id === sectorFilter);
  const emptyMessage = hasSearch || hasAdvancedFilters
    ? "No hay usuarios para el filtro aplicado."
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
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-4 lg:items-end">
            <div className="lg:col-span-2">
              <label className="text-sm font-medium text-gray-700">Buscar usuario</label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Nombre, funcionario, cedula, rol o sector"
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Rol</label>
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">Todos</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="super-user">Super user</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Sector</label>
              <select
                value={sectorFilter}
                onChange={(event) => setSectorFilter(event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">Todos</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.title}
                  </option>
                ))}
              </select>
              {sectorFilter !== "all" && (
                <div className="mt-2">
                  <SectorBadge title={selectedSector?.title} color={selectedSector?.color} />
                </div>
              )}
            </div>
          </div>

          {(hasSearch || hasAdvancedFilters) && (
            <div className="mt-3 flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                  setSectorFilter("all");
                }}
              >
                <X className="h-4 w-4" />
                Limpiar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateUserFormCard
        isVisible={isFormVisible}
        isSubmitting={isPosting}
        sectors={sectors}
        onSubmit={handleSubmit}
        onClose={() => setIsFormVisible(false)}
      />

      <UsersTable
        users={paginatedUsers}
        openMenuUserId={openMenuUserId}
        onOpenActions={(userId) => setOpenMenuUserId(userId)}
        emptyMessage={emptyMessage}
      />

      {totalPages > 1 && (
        <div className="mt-2">
          <CustomPagination totalPages={totalPages} />
        </div>
      )}

      {openMenuUserId && selectedUser && (
        <UserActionsModal
          user={selectedUser}
          sectors={sectors}
          selectedSectorId={selectedSectorIdForModal}
          password={passwordDrafts[selectedUser.id] || ""}
          isUpdatingStatus={updatingStatusUserId === selectedUser.id}
          isUpdatingSuperUser={updatingSuperUserId === selectedUser.id}
          isUpdatingSector={updatingSectorUserId === selectedUser.id}
          isUpdatingPassword={updatingPasswordUserId === selectedUser.id}
          isDeleting={deletingUserId === selectedUser.id}
          onPasswordChange={(value) =>
            setPasswordDrafts((prev) => ({ ...prev, [selectedUser.id]: value }))
          }
          onSectorChange={(value) =>
            setSectorDrafts((prev) => ({ ...prev, [selectedUser.id]: value }))
          }
          onToggleStatus={() => handleToggleStatus(selectedUser.id, !selectedUser.isActive)}
          onToggleSuperUser={() =>
            handleToggleSuperUser(
              selectedUser.id,
              !(
                selectedUser.isSuperUser ||
                (selectedUser.roles || []).includes("super-user") ||
                (selectedUser.roles || []).includes("super")
              ),
            )
          }
          onUpdateSector={() => handleUpdateSector(selectedUser.id)}
          onUpdatePassword={() => handleUpdatePassword(selectedUser.id)}
          onDelete={() => handleDeleteUser(selectedUser.id)}
          onClose={() => setOpenMenuUserId(null)}
        />
      )}
    </>
  );
};
