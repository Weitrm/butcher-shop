type UserStatusBadgeProps = {
  isActive: boolean;
};

export const UserStatusBadge = ({ isActive }: UserStatusBadgeProps) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
      isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    }`}
  >
    {isActive ? "Activo" : "Inactivo"}
  </span>
);
