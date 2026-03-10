type UserLike = {
  isSuperUser?: boolean | null;
  roles?: string[] | null;
};

const SUPER_ROLES = new Set(["super-user", "super"]);

export const hasSuperUserRole = (user?: UserLike | null) =>
  Boolean(user?.isSuperUser || (user?.roles || []).some((role) => SUPER_ROLES.has(role)));

export const hasAdminRole = (user?: UserLike | null) =>
  Boolean((user?.roles || []).includes("admin"));
