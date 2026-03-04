import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  Clock3,
  Search,
  ShoppingCart,
  TrendingUp,
  X,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { Bar, CartesianGrid, Cell, ComposedChart, Line, XAxis, YAxis } from "recharts";

import { AdminTitle } from "@/admin/components/AdminTitle";
import { useAdminOrders } from "@/admin/hooks/useAdminOrders";
import { useAdminOrdersSummary } from "@/admin/hooks/useAdminOrdersSummary";
import { useDashboardStats } from "@/admin/hooks/useDashboardStats";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { CustomPagination } from "@/components/custom/CustomPagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DashboardActivityPoint } from "@/interface/dashboard.interface";
import { currencyFormatter } from "@/lib/currency-formatter";
import {
  formatOrderItemSummary,
  formatOrderUnitsSummary,
  isOrderPriceAvailable,
} from "@/lib/order-unit";

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  completed: "Completado",
  cancelled: "Cancelado",
};

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString("es-UY", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const rangeOptions = [
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "year", label: "Año" },
] as const;

interface ActivityChartPoint extends DashboardActivityPoint {
  label: string;
  shortLabel: string;
}

interface ChartClickState {
  activePayload?: Array<{
    payload?: {
      date?: string;
    };
  }>;
}

type AttentionCardTone = "critical" | "warning" | "info";

interface AttentionCard {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  tone: AttentionCardTone;
  icon: typeof AlertTriangle;
}

const attentionCardStyles: Record<
  AttentionCardTone,
  {
    wrapper: string;
    badge: string;
    button: string;
  }
> = {
  critical: {
    wrapper: "border-amber-200 bg-amber-50",
    badge: "bg-amber-100 text-amber-800",
    button: "text-amber-900 hover:bg-amber-100",
  },
  warning: {
    wrapper: "border-blue-200 bg-blue-50",
    badge: "bg-blue-100 text-blue-800",
    button: "text-blue-900 hover:bg-blue-100",
  },
  info: {
    wrapper: "border-slate-200 bg-white",
    badge: "bg-slate-100 text-slate-700",
    button: "text-slate-900 hover:bg-slate-100",
  },
};

const formatRelativeTime = (value: string) => {
  const elapsedMs = Date.now() - new Date(value).getTime();
  const elapsedMinutes = Math.max(0, Math.floor(elapsedMs / (1000 * 60)));

  if (elapsedMinutes < 1) return "Hace menos de 1 min";
  if (elapsedMinutes < 60) return `Hace ${elapsedMinutes} min`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `Hace ${elapsedHours} h`;

  const elapsedDays = Math.floor(elapsedHours / 24);
  return `Hace ${elapsedDays} d`;
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const lastDebouncedQueryRef = useRef(debouncedQuery);
  const [selectedActivityDate, setSelectedActivityDate] = useState<string | null>(
    null,
  );
  const [isActivityDetailOpen, setIsActivityDetailOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = searchParams.get("page") || "1";
  const rangeParam = searchParams.get("range") || "week";
  const parsedPage = Number(pageParam);
  const page = Number.isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);
  const range =
    rangeParam === "month" || rangeParam === "year" ? rangeParam : "week";
  const limit = 5;
  const offset = (page - 1) * limit;
  const { data, isLoading, isFetching, refetch } = useDashboardStats({
    query: debouncedQuery,
    limit,
    offset,
    range,
  });
  const {
    data: globalSummaryData,
    isLoading: isGlobalSummaryLoading,
    refetch: refetchGlobalSummary,
  } = useAdminOrdersSummary({
    scope: "all",
    useSearchParams: false,
  });
  const {
    data: weeklySummaryData,
    isLoading: isWeeklySummaryLoading,
    refetch: refetchWeeklySummary,
  } = useAdminOrdersSummary({
    scope: "week",
    useSearchParams: false,
  });
  const {
    data: weeklyBoxOrdersData,
    isLoading: isWeeklyBoxOrdersLoading,
    refetch: refetchWeeklyBoxOrders,
  } = useAdminOrders({
    scope: "week",
    useSearchParams: false,
    hasBoxes: true,
    limit: 1,
    page: 1,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const hasQueryChanged = lastDebouncedQueryRef.current !== debouncedQuery;
    lastDebouncedQueryRef.current = debouncedQuery;

    if (!hasQueryChanged || page === 1) return;

    if (page !== 1) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("page", "1");
      setSearchParams(nextParams, { replace: true });
    }
  }, [debouncedQuery, page, searchParams, setSearchParams]);

  const topProducts = data?.topProducts || [];
  const topProductsPages = data?.topProductsPages || 0;
  const recentOrders = data?.recentOrders || [];
  const orderCounts = data?.orderCounts || { day: 0, week: 0, month: 0 };
  const globalSummary = globalSummaryData || {
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
  };
  const weeklySummary = weeklySummaryData || {
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
  };
  const weeklyBoxOrdersCount = weeklyBoxOrdersData?.count || 0;
  const isOperationalSummaryLoading =
    isGlobalSummaryLoading || isWeeklySummaryLoading || isWeeklyBoxOrdersLoading;
  const chartConfig = {
    totalKg: {
      label: "Kg",
      color: "var(--chart-1)",
    },
    totalOrders: {
      label: "Pedidos",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;
  const isYearRange = range === "year";
  const isMonthRange = range === "month";
  const xAxisInterval = isMonthRange ? "preserveStartEnd" : 0;
  const activityData: ActivityChartPoint[] = useMemo(
    () =>
      (data?.activity || []).map((entry) => {
        const parsedDate = isYearRange
          ? new Date(`${entry.date}-01T00:00:00`)
          : new Date(`${entry.date}T00:00:00`);

        return {
          ...entry,
          products: entry.products || [],
          label: parsedDate.toLocaleDateString("es-AR", {
            month: isYearRange ? "long" : undefined,
            year: isYearRange ? "numeric" : undefined,
            dateStyle: isYearRange ? undefined : "medium",
          }),
          shortLabel: parsedDate.toLocaleDateString(
            "es-UY",
            isYearRange
              ? { month: "short", year: "2-digit" }
              : { day: "2-digit", month: "short" },
          ),
        };
      }),
    [data?.activity, isYearRange],
  );
  const fallbackActivityDate = useMemo(() => {
    if (activityData.length === 0) {
      return null;
    }

    const latestWithOrders = [...activityData]
      .reverse()
      .find((entry) => entry.totalOrders > 0);

    return (latestWithOrders || activityData[activityData.length - 1]).date;
  }, [activityData]);
  const activeActivityDate =
    selectedActivityDate &&
    activityData.some((entry) => entry.date === selectedActivityDate)
      ? selectedActivityDate
      : fallbackActivityDate;
  const selectedActivity = useMemo(
    () => activityData.find((entry) => entry.date === activeActivityDate) || null,
    [activityData, activeActivityDate],
  );
  const peakActivity = useMemo(() => {
    if (activityData.length === 0) return null;

    return activityData.reduce((best, current) => {
      if (current.totalOrders > best.totalOrders) return current;
      if (current.totalOrders === best.totalOrders && current.totalKg > best.totalKg) return current;
      return best;
    }, activityData[0]);
  }, [activityData]);
  const latestRecentOrder = recentOrders[0] || null;
  const globalPendingShare = globalSummary.total
    ? Math.round((globalSummary.pending / globalSummary.total) * 100)
    : 0;
  const averageWeeklyOrdersPerDay = Math.max(0, Math.round((orderCounts.week / 7) * 10) / 10);
  const rangeHint =
    range === "year"
      ? "Últimos 12 meses."
      : range === "month"
        ? "Últimos 30 días."
        : "Últimos 7 días.";

  const handleRefreshDashboard = () => {
    refetch();
    refetchGlobalSummary();
    refetchWeeklySummary();
    refetchWeeklyBoxOrders();
  };

  const handleRangeChange = (nextRange: "week" | "month" | "year") => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("range", nextRange);
    setSearchParams(nextParams, { replace: true });
  };

  const handleActivityClick = (state: ChartClickState) => {
    const date = state.activePayload?.[0]?.payload?.date;
    if (typeof date === "string") {
      setSelectedActivityDate(date);
      setIsActivityDetailOpen(true);
    }
  };

  const handleOpenPeakActivity = () => {
    if (!peakActivity) return;
    setSelectedActivityDate(peakActivity.date);
    setIsActivityDetailOpen(true);
  };

  const navigateToOrders = (filters: { status?: "pending" | "completed" | "cancelled"; hasBoxes?: boolean } = {}) => {
    const nextParams = new URLSearchParams();

    if (filters.status) {
      nextParams.set("status", filters.status);
    }

    if (filters.hasBoxes) {
      nextParams.set("hasBoxes", "true");
    }

    navigate(nextParams.size > 0 ? `/admin/orders?${nextParams.toString()}` : "/admin/orders");
  };

  const handleOpenProduct = (value: string) => {
    const nextParams = new URLSearchParams();
    nextParams.set("query", value);
    navigate(`/admin/products?${nextParams.toString()}`);
  };

  const attentionCards: AttentionCard[] = [];

  attentionCards.push({
    id: "week-pending",
    title:
      weeklySummary.pending > 0
        ? `${weeklySummary.pending} pendientes esta semana`
        : "Sin pendientes esta semana",
    description:
      weeklySummary.pending > 0
        ? "Vista operativa lista para cerrar pedidos pendientes."
        : "No hay pedidos pendientes dentro de la semana actual.",
    actionLabel: "Ver ordenes",
    onAction: () => navigateToOrders({ status: "pending" }),
    tone: weeklySummary.pending > 0 ? "critical" : "info",
    icon: AlertTriangle,
  });

  attentionCards.push({
    id: "week-boxes",
    title:
      weeklyBoxOrdersCount > 0
        ? `${weeklyBoxOrdersCount} pedidos con cajas`
        : "Sin pedidos con cajas",
    description:
      weeklyBoxOrdersCount > 0
        ? "Estos pedidos requieren validacion manual de precio."
        : "No hay pedidos de caja para revisar esta semana.",
    actionLabel: "Ver pedidos",
    onAction: () => navigateToOrders({ hasBoxes: true }),
    tone: weeklyBoxOrdersCount > 0 ? "warning" : "info",
    icon: Boxes,
  });

  if (peakActivity && peakActivity.totalOrders > 0) {
    attentionCards.push({
      id: "peak-activity",
      title: "Pico de demanda",
      description: `${peakActivity.label}: ${peakActivity.totalOrders} pedidos y ${peakActivity.totalKg} kg.`,
      actionLabel: "Ver detalle",
      onAction: handleOpenPeakActivity,
      tone: "info",
      icon: TrendingUp,
    });
  }

  if (latestRecentOrder) {
    attentionCards.push({
      id: "latest-order",
      title: "Ultimo ingreso",
      description: `${formatRelativeTime(latestRecentOrder.createdAt)}. ${
        latestRecentOrder.user?.fullName || "Cliente"
      } genero el pedido mas reciente.`,
      actionLabel: "Ver ordenes",
      onAction: () => navigateToOrders(),
      tone: "info",
      icon: Clock3,
    });
  } else {
    attentionCards.push({
      id: "empty-state",
      title: "Sin pedidos recientes",
      description: "Todavia no hay movimiento para mostrar en el panel.",
      actionLabel: "Ver ordenes",
      onAction: () => navigateToOrders(),
      tone: "info",
      icon: Clock3,
    });
  }

  if (attentionCards.length < 4) {
    attentionCards.push({
      id: "day-orders",
      title: orderCounts.day > 0 ? `${orderCounts.day} pedidos hoy` : "Sin pedidos hoy",
      description:
        orderCounts.day > 0
          ? "El panel ya tiene actividad cargada en el dia de hoy."
          : "Conviene monitorear si la demanda se desplazo o el ingreso viene lento.",
      actionLabel: "Ver ordenes",
      onAction: () => navigateToOrders(),
      tone: orderCounts.day > 0 ? "info" : "warning",
      icon: ShoppingCart,
    });
  }

  useEffect(() => {
    if (!isActivityDetailOpen) return;
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsActivityDetailOpen(false);
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isActivityDetailOpen]);

  if (isLoading && !data) {
    return <CustomFullScreenLoading />;
  }

  return (
    <>
      <AdminTitle title="Dashboard" subtitle="Panel de control" />

      <Card className="mb-6 overflow-hidden border-0 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                Resumen Operativo
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Estado actual del sistema
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                Pendientes y pedidos con validacion manual calculados sobre todos los pedidos.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="bg-white text-slate-900 hover:bg-white/90"
                  onClick={() => navigate("/admin/history")}
                >
                  Ver historial
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-white/20 bg-transparent text-white hover:bg-white/10"
                  onClick={handleRefreshDashboard}
                >
                  {isFetching ? "Actualizando..." : "Actualizar"}
                </Button>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-slate-300">Pendientes globales</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {isOperationalSummaryLoading ? "-" : globalSummary.pending}
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  {isOperationalSummaryLoading
                    ? "Calculando..."
                    : `${globalPendingShare}% del total de pedidos.`}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-slate-300">Pedidos globales</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {isOperationalSummaryLoading ? "-" : globalSummary.total}
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  {isOperationalSummaryLoading
                    ? "Calculando..."
                    : "Base total sobre la que se calcula la carga operativa."}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-slate-300">Pendientes semana</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {isOperationalSummaryLoading ? "-" : weeklySummary.pending}
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  {isOperationalSummaryLoading
                    ? "Calculando..."
                    : "Abrir en Ordenes para resolverlos."}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-slate-300">Pedidos con cajas</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {isOperationalSummaryLoading ? "-" : weeklyBoxOrdersCount}
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  {isOperationalSummaryLoading
                    ? "Calculando..."
                    : "Conteo exacto dentro de la semana actual."}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-8 grid grid-cols-1 gap-4 xl:grid-cols-4">
        {attentionCards.slice(0, 4).map((card) => {
          const Icon = card.icon;
          const styles = attentionCardStyles[card.tone];

          return (
            <Card key={card.id} className={`border shadow-sm ${styles.wrapper}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className={`inline-flex rounded-lg p-2 ${styles.badge}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <button
                    type="button"
                    onClick={card.onAction}
                    className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors ${styles.button}`}
                  >
                    {card.actionLabel}
                  </button>
                </div>
                <p className="mt-4 text-base font-semibold text-gray-900">{card.title}</p>
                <p className="mt-2 text-sm text-gray-600">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Productos más pedidos
                </h3>
                <p className="text-sm text-gray-500">
                  Últimos 7 días, ordenados por kg acumulados.
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar por nombre o slug"
                  className="pl-9 bg-blue-50/60 border-blue-200 focus-visible:ring-blue-200"
                />
                {isFetching && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-500">
                    Buscando...
                  </span>
                )}
              </div>
            </div>

            {topProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-gray-500">
                No hay datos para esta semana.
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                <button
                  type="button"
                  onClick={() => handleOpenProduct(topProducts[0].slug)}
                  className="rounded-2xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-left text-white shadow-md transition-transform hover:-translate-y-0.5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                    Producto lider
                  </p>
                  <p className="mt-3 text-2xl font-semibold">{topProducts[0].title}</p>
                  <p className="mt-1 text-sm text-slate-300">{topProducts[0].slug}</p>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/10 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-300">Kg</p>
                      <p className="mt-1 text-2xl font-semibold">{topProducts[0].totalKg}</p>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-300">Pedidos</p>
                      <p className="mt-1 text-2xl font-semibold">{topProducts[0].totalOrders}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-xs font-medium text-slate-300">
                    Abrir producto para revisar detalle o ajustar stock.
                  </p>
                </button>

                <div className="space-y-3">
                  {topProducts.slice(1).map((product, index) => (
                    <button
                      key={product.productId}
                      type="button"
                      onClick={() => handleOpenProduct(product.slug)}
                      className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                          {index + 2}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {product.title}
                          </p>
                          <p className="truncate text-xs text-slate-500">{product.slug}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">{product.totalKg} kg</p>
                        <p className="text-xs text-slate-500">{product.totalOrders} pedidos</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <CustomPagination totalPages={topProductsPages} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900">Últimos pedidos</h3>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRefreshDashboard}
                disabled={isFetching}
              >
                {isFetching ? "Actualizando..." : "Actualizar"}
              </Button>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-500">No hay pedidos recientes.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {order.user?.employeeNumber
                            ? `Func. ${order.user.employeeNumber}`
                            : "Funcionario sin número"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.user?.fullName || "Cliente"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          statusStyles[order.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      {order.items
                        .map((item) =>
                          item.product
                            ? formatOrderItemSummary(
                                item.product.title,
                                item.kg,
                                item.isBox,
                              )
                            : "",
                        )
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>{formatDate(order.createdAt)}</span>
                      <span className="font-semibold text-gray-900">
                        {isOrderPriceAvailable(order.items)
                          ? currencyFormatter(order.totalPrice)
                          : "Precio no disponible"}{" "}
                        -{" "}
                        {formatOrderUnitsSummary(order.items, order.totalKg)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Pedidos de hoy</p>
            <p className="text-3xl font-semibold text-gray-900">{orderCounts.day}</p>
            <p className="mt-1 text-xs text-gray-500">Carga del dia actual.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Pedidos de la semana</p>
            <p className="text-3xl font-semibold text-gray-900">{orderCounts.week}</p>
            <p className="mt-1 text-xs text-gray-500">
              Ritmo diario: {averageWeeklyOrdersPerDay} pedidos.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Pedidos del mes</p>
            <p className="text-3xl font-semibold text-gray-900">{orderCounts.month}</p>
            <p className="mt-1 text-xs text-gray-500">Acumulado del ultimo mes.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Pedidos con cajas</p>
            <p className="text-3xl font-semibold text-gray-900">{weeklyBoxOrdersCount}</p>
            <p className="mt-1 text-xs text-gray-500">
              {weeklySummary.total > 0
                ? `${Math.round((weeklyBoxOrdersCount / weeklySummary.total) * 100)}% del volumen semanal.`
                : "Sin pedidos para medir."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8 min-w-0 overflow-hidden">
        <CardContent className="p-6 space-y-4 min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Movimiento del periodo
              </h3>
              <p className="text-sm text-gray-500">
                {rangeHint} Kg vendidos y pedidos. Seleccioná una fecha para ver detalle.
              </p>
            </div>
            <div className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
              {rangeOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={range === option.value ? "default" : "ghost"}
                  className={
                    range === option.value
                      ? "bg-gray-900 text-white hover:bg-gray-900"
                      : "text-gray-600"
                  }
                  onClick={() => handleRangeChange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="w-full min-w-0 overflow-hidden">
            <ChartContainer config={chartConfig} className="h-[260px] w-full min-w-0">
              <ComposedChart
                data={activityData}
                margin={{ top: 10, right: 24, left: 0, bottom: 0 }}
                onClick={handleActivityClick}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="shortLabel"
                  tickLine={false}
                  axisLine={false}
                  interval={xAxisInterval}
                  minTickGap={18}
                  tickMargin={8}
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <ChartTooltip
                  cursor={{ fill: "rgba(15, 23, 42, 0.05)" }}
                  content={<ChartTooltipContent />}
                />
                <ChartLegend verticalAlign="top" align="right" />
                <Bar
                  yAxisId="left"
                  dataKey="totalKg"
                  name="Kg"
                  fill="var(--color-totalKg)"
                  cursor="pointer"
                  radius={[6, 6, 0, 0]}
                >
                  {activityData.map((entry) => (
                    <Cell
                      key={entry.date}
                      fill="var(--color-totalKg)"
                      fillOpacity={activeActivityDate === entry.date ? 1 : 0.45}
                    />
                  ))}
                </Bar>
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="totalOrders"
                  name="Pedidos"
                  stroke="var(--color-totalOrders)"
                  strokeWidth={2}
                  dot={{ r: 4, style: { cursor: "pointer" } }}
                />
              </ComposedChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {isActivityDetailOpen && selectedActivity ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsActivityDetailOpen(false)}
        >
          <div
            className="w-[760px] max-w-[calc(100%-2rem)] max-h-[85vh] rounded-xl bg-white shadow-xl overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Detalle del {selectedActivity.label}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedActivity.totalOrders} pedidos - {selectedActivity.totalKg} kg
                </p>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setIsActivityDetailOpen(false)}
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-[calc(85vh-84px)] overflow-y-auto p-6">
              {selectedActivity.products.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Kg</TableHead>
                      <TableHead>Pedidos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedActivity.products.map((product) => (
                      <TableRow key={`${selectedActivity.date}-${product.productId}`}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{product.title}</span>
                            <span className="text-xs text-gray-500">{product.slug}</span>
                          </div>
                        </TableCell>
                        <TableCell>{product.totalKg} kg</TableCell>
                        <TableCell>{product.totalOrders}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-gray-500">
                  No se registraron productos para esta fecha.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
