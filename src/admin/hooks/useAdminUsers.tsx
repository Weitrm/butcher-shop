import { useQuery } from "@tanstack/react-query";
import { getAdminUsersAction } from "../actions/get-admin-users.action";

export const useAdminUsers = () =>
  useQuery({
    queryKey: ["admin-users"],
    queryFn: getAdminUsersAction,
    staleTime: 1000 * 60,
  });
