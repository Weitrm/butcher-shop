import { AdminTitle } from "@/admin/components/AdminTitle";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";

import { CreateUserFormCard } from "./components/CreateUserFormCard";
import { CreateUserToggle } from "./components/CreateUserToggle";
import { UserActionsModal } from "./components/UserActionsModal";
import { UsersTable } from "./components/UsersTable";
import { useAdminUsersController } from "./hooks/useAdminUsersController";

export const AdminUsersPage = () => {
  const {
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
  } = useAdminUsersController();

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

      <CreateUserFormCard
        isVisible={isFormVisible}
        isSubmitting={isPosting}
        onSubmit={handleSubmit}
      />

      <UsersTable
        users={users}
        openMenuUserId={openMenuUserId}
        onOpenActions={(userId) => setOpenMenuUserId(userId)}
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
