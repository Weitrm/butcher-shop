import { useEffect, useMemo, useState } from "react";
import { Search, ShoppingCart, X } from "lucide-react";
import { useSearchParams } from "react-router";
import { Bar, CartesianGrid, Cell, ComposedChart, Line, XAxis, YAxis } from "recharts";

import { AdminTitle } from "@/admin/components/AdminTitle";
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

export const DashboardPage = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
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

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
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
  const rangeHint =
    range === "year"
      ? "Últimos 12 meses."
      : range === "month"
        ? "Últimos 30 días."
        : "Últimos 7 días.";

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

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Kg</TableHead>
                  <TableHead>Pedidos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-gray-500">
                      No hay datos para esta semana.
                    </TableCell>
                  </TableRow>
                ) : (
                  topProducts.map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{product.title}</span>
                          <span className="text-xs text-gray-500">{product.slug}</span>
                        </div>
                      </TableCell>
                      <TableCell>{product.totalKg} kg</TableCell>
                      <TableCell>{product.totalOrders}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
                onClick={() => refetch()}
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
                            ? `${item.product.title} (${item.kg}kg${item.isBox ? ", caja" : ""})`
                            : "",
                        )
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>{formatDate(order.createdAt)}</span>
                      <span className="font-semibold text-gray-900">
                        {currencyFormatter(order.totalPrice)} - {order.totalKg} kg
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-8 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Pedidos de hoy</p>
            <p className="text-3xl font-semibold text-gray-900">{orderCounts.day}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Pedidos de la semana</p>
            <p className="text-3xl font-semibold text-gray-900">{orderCounts.week}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-gray-500">Pedidos del mes</p>
            <p className="text-3xl font-semibold text-gray-900">{orderCounts.month}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8 min-w-0 overflow-hidden">
        <CardContent className="p-6 space-y-4 min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Tendencia de demanda
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
