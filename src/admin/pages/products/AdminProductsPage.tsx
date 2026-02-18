import { useState } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";

import { updateOrderSettingsAction } from "@/admin/actions/update-order-settings.action";
import { AdminTitle } from "@/admin/components/AdminTitle";
import { useAdminProducts } from "@/admin/hooks/useAdminProducts";
import { deleteProductAction } from "@/admin/actions/delete-product.action";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { CustomPagination } from "@/components/custom/CustomPagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { currencyFormatter } from "@/lib/currency-formatter";
import { useOrderSettings } from "@/shop/hooks/useOrderSettings";

export const AdminProductsPage = () => {
  const { data, isLoading } = useAdminProducts();
  const { data: settings } = useOrderSettings();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [maxKgDraft, setMaxKgDraft] = useState("");
  const [isMaxKgDirty, setIsMaxKgDirty] = useState(false);
  const [maxItemsDraft, setMaxItemsDraft] = useState("");
  const [isMaxItemsDirty, setIsMaxItemsDirty] = useState(false);
  const status = searchParams.get("status") || "all";
  const maxKgInputValue = isMaxKgDirty ? maxKgDraft : String(settings?.maxTotalKg ?? 10);
  const maxItemsInputValue = isMaxItemsDirty ? maxItemsDraft : String(settings?.maxItems ?? 2);

  const deleteMutation = useMutation({
    mutationFn: deleteProductAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Producto eliminado con éxito");
    },
    onError: (error) => {
      console.error("Error al eliminar producto", error);
      toast.error("Error al eliminar producto");
    },
  });

  const settingsMutation = useMutation({
    mutationFn: updateOrderSettingsAction,
  });

  const handleDelete = async (productId: string) => {
    const confirmDelete = window.confirm("¿Seguro que quieres eliminar este producto?");
    if (!confirmDelete) return;

    await deleteMutation.mutateAsync(productId);
  };

  const handleUpdateSettings = async () => {
    const parsedMaxKg = Number(maxKgInputValue);
    const parsedMaxItems = Number(maxItemsInputValue);
    if (!Number.isFinite(parsedMaxKg) || parsedMaxKg < 1) {
      toast.error("Ingresa un límite de kg válido mayor que 0");
      return;
    }
    if (!Number.isFinite(parsedMaxItems) || parsedMaxItems < 1) {
      toast.error("Ingresa un límite de productos válido mayor que 0");
      return;
    }

    try {
      const nextMaxKg = Math.floor(parsedMaxKg);
      const nextMaxItems = Math.floor(parsedMaxItems);
      await settingsMutation.mutateAsync({
        maxTotalKg: nextMaxKg,
        maxItems: nextMaxItems,
      });
      await queryClient.invalidateQueries({ queryKey: ["order-settings"] });
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      setMaxKgDraft(String(nextMaxKg));
      setMaxItemsDraft(String(nextMaxItems));
      setIsMaxKgDirty(false);
      setIsMaxItemsDirty(false);
      toast.success("Límites globales actualizados");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        const normalizedMessage = Array.isArray(message) ? message.join(", ") : message;
        toast.error(normalizedMessage || "No se pudieron actualizar los límites");
      } else {
        toast.error("No se pudieron actualizar los límites");
      }
    }
  };

  if (isLoading) {
    return <CustomFullScreenLoading />;
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <AdminTitle title="Productos" subtitle="Gestión de productos" />

        <div className="flex justify-end mb-10 gap-4">
          <select
            value={status}
            onChange={(event) => {
              const nextParams = new URLSearchParams(searchParams);
              const value = event.target.value;
              if (value === "all") {
                nextParams.delete("status");
              } else {
                nextParams.set("status", value);
              }
              nextParams.set("page", "1");
              setSearchParams(nextParams);
            }}
            className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <Link to="/admin/products/new">
            <Button>
              <PlusIcon /> Nuevo producto
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-xs">
        <p className="text-sm font-medium text-gray-700">Límites globales por pedido</p>
        <p className="mt-1 text-xs text-gray-500">
          Estos límites aplican a usuarios normales. Los superusuarios no tienen límite.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs text-gray-500">Máximo kg total</p>
            <Input
              type="number"
              min={1}
              value={maxKgInputValue}
              onChange={(event) => {
                setIsMaxKgDirty(true);
                setMaxKgDraft(event.target.value);
              }}
              className="w-full"
            />
          </div>
          <div>
            <p className="mb-1 text-xs text-gray-500">Máximo productos distintos</p>
            <Input
              type="number"
              min={1}
              value={maxItemsInputValue}
              onChange={(event) => {
                setIsMaxItemsDirty(true);
                setMaxItemsDraft(event.target.value);
              }}
              className="w-full"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            onClick={handleUpdateSettings}
            disabled={settingsMutation.isPending}
            className="sm:w-auto"
          >
            {settingsMutation.isPending ? "Guardando..." : "Guardar límites"}
          </Button>
        </div>
      </div>

      <Table className="bg-white p-10 shadow-xs border border-gray-200 mb-10">
        <TableHeader>
          <TableRow>
            <TableHead>Imagen</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Inventario</TableHead>
            <TableHead>Máx. kg</TableHead>
            <TableHead>Cajas</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data!.products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-20 h-20 object-cover rounded-md"
                />
              </TableCell>
              <TableCell>
                <Link
                  to={`/admin/products/${product.id}`}
                  className=" hover:text-blue-500 hover:underline"
                >
                  {product.title}
                </Link>
              </TableCell>
              <TableCell>{currencyFormatter(product.price)}</TableCell>
              <TableCell>{product.stock} en stock</TableCell>
              <TableCell>{product.maxKgPerOrder} kg</TableCell>
              <TableCell>{product.allowBoxes ? "Sí" : "No"}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    product.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.isActive ? "Activo" : "Inactivo"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end items-center gap-3">
                  <Link to={`/admin/products/${product.id}`}>
                    <PencilIcon className="w-5 h-5 text-blue-500" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    className="text-red-500 hover:text-red-600"
                    aria-label={`Eliminar ${product.title}`}
                  >
                    <Trash2Icon className="w-5 h-5" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <CustomPagination totalPages={data?.pages || 0} />
    </>
  );
};
