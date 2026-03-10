import type { OrderStatus } from "@/interface/order.interface";

export type AdminOrdersScope = "week" | "history" | "all";

type AdminOrderFilterOptions = {
  scope?: AdminOrdersScope;
  status?: OrderStatus;
  hasBoxes?: boolean;
};

type ResolveAdminOrderFiltersParams = {
  searchParams: URLSearchParams;
  useSearchParams: boolean;
  options?: AdminOrderFilterOptions;
};

export type ResolvedAdminOrderFilters = {
  scope: AdminOrdersScope;
  user?: string;
  product?: string;
  fromDate?: string;
  toDate?: string;
  sectorId?: string;
  preparationDate?: string;
  status?: OrderStatus;
  hasBoxes?: boolean;
};

const normalizeParam = (value: string | null) => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

const parseStatus = (value: string | null): OrderStatus | undefined => {
  if (value === "pending" || value === "completed" || value === "cancelled") {
    return value;
  }
  return undefined;
};

const parseBooleanParam = (value: string | null): boolean | undefined => {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
};

const toQueryKeyValue = (value: string | undefined) => value || "";

export const resolveAdminOrderFilters = ({
  searchParams,
  useSearchParams,
  options,
}: ResolveAdminOrderFiltersParams): ResolvedAdminOrderFilters => {
  const scope = options?.scope || "all";
  const user = useSearchParams ? normalizeParam(searchParams.get("user")) : undefined;
  const product = useSearchParams ? normalizeParam(searchParams.get("product")) : undefined;
  const fromDate = useSearchParams ? normalizeParam(searchParams.get("fromDate")) : undefined;
  const toDate = useSearchParams ? normalizeParam(searchParams.get("toDate")) : undefined;
  const sectorId = useSearchParams ? normalizeParam(searchParams.get("sectorId")) : undefined;
  const preparationDate = useSearchParams
    ? normalizeParam(searchParams.get("preparationDate"))
    : undefined;
  const statusParam = useSearchParams ? parseStatus(searchParams.get("status")) : undefined;
  const hasBoxesParam = useSearchParams
    ? parseBooleanParam(searchParams.get("hasBoxes"))
    : undefined;

  return {
    scope,
    user,
    product,
    fromDate,
    toDate,
    sectorId,
    preparationDate,
    status: options?.status ?? statusParam,
    hasBoxes: typeof options?.hasBoxes === "boolean" ? options.hasBoxes : hasBoxesParam,
  };
};

export const buildAdminOrderFiltersQueryKey = (filters: ResolvedAdminOrderFilters) => ({
  scope: filters.scope,
  user: toQueryKeyValue(filters.user),
  product: toQueryKeyValue(filters.product),
  fromDate: toQueryKeyValue(filters.fromDate),
  toDate: toQueryKeyValue(filters.toDate),
  sectorId: toQueryKeyValue(filters.sectorId),
  preparationDate: toQueryKeyValue(filters.preparationDate),
  status: filters.status || "",
  hasBoxes: filters.hasBoxes === true ? "true" : filters.hasBoxes === false ? "false" : "",
});
