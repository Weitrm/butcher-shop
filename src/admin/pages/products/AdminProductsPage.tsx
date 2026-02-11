import { AdminTitle } from "@/admin/components/AdminTitle"
import { CustomFullScreenLoading } from "@/components/custom/CustomFullScreenLoading"
import { CustomPagination } from "@/components/custom/CustomPagination"
import { Button } from "@/components/ui/button"
import {Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { currencyFormatter } from "@/lib/currency-formatter"
import { useAdminProducts } from "@/admin/hooks/useAdminProducts"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { Link, useSearchParams } from "react-router"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteProductAction } from "@/admin/actions/delete-product.action"
import { toast } from "sonner"



export const AdminProductsPage = () => {
  const { data, isLoading } = useAdminProducts();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || 'all';

  const deleteMutation = useMutation({
    mutationFn: deleteProductAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Producto eliminado con éxito');
    },
    onError: (error) => {
      console.error('Error al eliminar producto', error);
      toast.error('Error al eliminar producto');
    }
  })

  const handleDelete = async (productId: string) => {
    const confirmDelete = window.confirm('Â¿Seguro que quieres eliminar este producto?');
    if (!confirmDelete) return;

    await deleteMutation.mutateAsync(productId);
  };
  
  if (isLoading) {
    return <CustomFullScreenLoading />
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
              if (value === 'all') {
                nextParams.delete('status');
              } else {
                nextParams.set('status', value);
              }
              nextParams.set('page', '1');
              setSearchParams(nextParams);
            }}
            className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <Link to="/admin/products/new"><Button><PlusIcon /> Nuevo Producto</Button></Link>  
        </div>
      </div>
      

      <Table className="bg-white p-10 shadow-xs border border-gray-200 mb-10">
        <TableHeader>
          <TableRow>
            <TableHead>Imagen</TableHead>
            <TableHead>Nombre</TableHead>
          <TableHead>Precio</TableHead>
          <TableHead>Inventario</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
          {
            data!.products.map(product => (
            <TableRow key={product.id}>
              <TableCell><img src={product.images[0]} alt={product.title} className="w-20 h-20 object-cover rounded-md"/></TableCell>
              <TableCell><Link to={`/admin/products/${product.id}`} className=" hover:text-blue-500 hover:underline">{product.title}</Link></TableCell>
              <TableCell>{currencyFormatter(product.price)}</TableCell>
              <TableCell>{product.stock} Stock</TableCell>
              <TableCell>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end items-center gap-3">
                  <Link to={`/admin/products/${product.id}`}>
                    <PencilIcon className="w-5 h-5 text-blue-500"/>
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
          ))
  }
        </TableBody>
      </Table>
      <CustomPagination totalPages={data?.pages || 0}/>
    </>
  )
}
