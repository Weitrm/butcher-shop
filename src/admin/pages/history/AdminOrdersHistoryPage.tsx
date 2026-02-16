import { useState } from "react";
import { useSearchParams } from "react-router";
import { Search, X } from "lucide-react";

import { AdminTitle } from "@/admin/components/AdminTitle";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { CustomPagination } from "@/components/custom/CustomPagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { currencyFormatter } from "@/lib/currency-formatter";
import { useAdminOrders } from "@/admin/hooks/useAdminOrders";

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

export const AdminOrdersHistoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialUser = searchParams.get("user") || "";
  const initialProduct = searchParams.get("product") || "";
  const [userQuery, setUserQuery] = useState(initialUser);
  const [productQuery, setProductQuery] = useState(initialProduct);
  const { data, isLoading } = useAdminOrders({ scope: "history" });
  const orders = data?.orders || [];

  const handleSearch = () => {
    const nextParams = new URLSearchParams(searchParams);
    if (userQuery.trim()) {
      nextParams.set("user", userQuery.trim());
    } else {
      nextParams.delete("user");
    }
    if (productQuery.trim()) {
      nextParams.set("product", productQuery.trim());
    } else {
      nextParams.delete("product");
    }
    nextParams.set("page", "1");
    setSearchParams(nextParams);
  };

  const handleClear = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("user");
    nextParams.delete("product");
    nextParams.set("page", "1");
    setSearchParams(nextParams);
    setUserQuery("");
    setProductQuery("");
  };

  if (isLoading) {
    return <CustomFullScreenLoading />;
  }

  return (
    <>
      <AdminTitle title="Historial" subtitle="Pedidos anteriores a la semana" />

      <Card className="mb-6">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                Buscar por cliente
              </label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={userQuery}
                  onChange={(event) => setUserQuery(event.target.value)}
                  placeholder="Nombre, funcionario o cédula"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                Buscar por producto
              </label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={productQuery}
                  onChange={(event) => setProductQuery(event.target.value)}
                  placeholder="Nombre o slug"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch}>Buscar</Button>
              <Button variant="outline" onClick={handleClear}>
                <X className="h-4 w-4" />
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table className="bg-white">
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Detalle</TableHead>
                <TableHead>Kg</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-gray-500">
                    No hay pedidos en el historial.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {order.user?.fullName || "Sin nombre"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {order.user
                            ? [
                                order.user.employeeNumber
                                  ? `Func. ${order.user.employeeNumber}`
                                  : null,
                                order.user.nationalId
                                  ? `CI ${order.user.nationalId}`
                                  : null,
                              ]
                                .filter(Boolean)
                                .join(" , ") || "-"
                            : "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[260px] truncate text-sm text-gray-600">
                        {order.items
                          .map((item) => `${item.product.title} (${item.kg}kg${item.isBox ? ", caja" : ""})`)
                          .join(", ")}
                      </div>
                    </TableCell>
                    <TableCell>{order.totalKg} kg</TableCell>
                    <TableCell>{currencyFormatter(order.totalPrice)}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell className="text-sm font-medium text-gray-700">
                      {statusLabels[order.status] || order.status}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-2">
        <CustomPagination  totalPages={data?.pages || 0} />
      </div>
    </>
  );
};
