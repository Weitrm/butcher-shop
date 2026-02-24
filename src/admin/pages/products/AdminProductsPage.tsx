import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PencilIcon, PlusIcon, Search, Trash2Icon, X } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";

import { deleteProductAction } from "@/admin/actions/delete-product.action";
import { AdminTitle } from "@/admin/components/AdminTitle";
import { useAdminProducts } from "@/admin/hooks/useAdminProducts";
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading";
import { CustomPagination } from "@/components/custom/CustomPagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { currencyFormatter } from "@/lib/currency-formatter";

export const AdminProductsPage = () => {
  const { data, isLoading } = useAdminProducts();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") || "all";
  const query = searchParams.get("query") || "";
  const [searchValue, setSearchValue] = useState(query);

  useEffect(() => {
    setSearchValue(query);
  }, [query]);

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

  const handleDelete = async (productId: string) => {
    const confirmDelete = window.confirm("¿Seguro que quieres eliminar este producto?");
    if (!confirmDelete) return;

    await deleteMutation.mutateAsync(productId);
  };

  const handleSearch = () => {
    const nextParams = new URLSearchParams(searchParams);
    const normalizedQuery = searchValue.trim();

    if (normalizedQuery) {
      nextParams.set("query", normalizedQuery);
    } else {
      nextParams.delete("query");
    }

    nextParams.set("page", "1");
    setSearchParams(nextParams);
  };

  const handleClearSearch = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("query");
    nextParams.set("page", "1");
    setSearchParams(nextParams);
    setSearchValue("");
  };

  if (isLoading) {
    return <CustomFullScreenLoading />;
  }

  return (
    <>
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <AdminTitle title="Productos" subtitle="Gestión de productos" />

        <div className="flex flex-wrap justify-end gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSearch();
                  }
                }}
                placeholder="Buscar por nombre o slug"
                className="h-9 w-64 pl-9"
              />
            </div>

            <Button type="button" variant="outline" onClick={handleSearch}>
              Buscar
            </Button>

            {(query || searchValue.trim()) && (
              <Button type="button" variant="outline" onClick={handleClearSearch}>
                <X className="h-4 w-4" />
                Limpiar
              </Button>
            )}
          </div>

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

      <Table className="mb-10 border border-gray-200 bg-white p-10 shadow-xs">
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
                  className="h-20 w-20 rounded-md object-cover"
                />
              </TableCell>
              <TableCell>
                <Link
                  to={`/admin/products/${product.id}`}
                  className="hover:text-blue-500 hover:underline"
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
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    product.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.isActive ? "Activo" : "Inactivo"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-3">
                  <Link to={`/admin/products/${product.id}`}>
                    <PencilIcon className="h-5 w-5 text-blue-500" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    className="text-red-500 hover:text-red-600"
                    aria-label={`Eliminar ${product.title}`}
                  >
                    <Trash2Icon className="h-5 w-5" />
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
