import { useQuery } from "@tanstack/react-query";
import { getAdminSectorsAction } from "../actions/get-admin-sectors.action";

export const useAdminSectors = () =>
  useQuery({
    queryKey: ["admin-sectors"],
    queryFn: getAdminSectorsAction,
    staleTime: 1000 * 60,
  });

