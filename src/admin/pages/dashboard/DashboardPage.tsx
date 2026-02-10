import { useEffect, useState } from "react";
import { Search, ShoppingCart } from "lucide-react";
import { useSearchParams } from "react-router";

import { AdminTitle } from "@/admin/components/AdminTitle";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { currencyFormatter } from "@/lib/currency-formatter";
import { useDashboardStats } from "@/admin/hooks/useDashboardStats";
import { CustomPagination } from "@/components/custom/CustomPagination";

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  completed: "Completado",
  cancelled: "Cancelado",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export const DashboardPage = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = searchParams.get("page") || "1";
  const parsedPage = Number(pageParam);
  const page = Number.isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);
  const limit = 5;
  const offset = (page - 1) * limit;
  const { data, isLoading, isFetching } = useDashboardStats({
    query: debouncedQuery,
    limit,
    offset,
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

  if (isLoading && !data) {
    return <CustomFullScreenLoading />;
  }

  const topProducts = data?.topProducts || [];
  const topProductsPages = data?.topProductsPages || 0;
  const recentOrders = data?.recentOrders || [];
  const orderCounts = data?.orderCounts || { day: 0, week: 0, month: 0 };

  return (
    <>
      <AdminTitle title="Dashboard" subtitle="Panel de control" />

      <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-blue-100">
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Productos mas pedidos
                </h3>
                <p className="text-sm text-gray-500">
                  Ultimos 7 dias, ordenados por kg acumulados.
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
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">Ultimos pedidos</h3>
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
                          #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.user?.fullName || "Cliente"}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      {order.items
                        .map((item) =>
                          item.product ? `${item.product.title} (${item.kg}kg)` : "",
                        )
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>{formatDate(order.createdAt)}</span>
                      <span className="font-semibold text-gray-900">
                        {currencyFormatter(order.totalPrice)} · {order.totalKg} kg
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
