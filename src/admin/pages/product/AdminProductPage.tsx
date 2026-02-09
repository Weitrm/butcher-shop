import { Navigate, useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { useProduct } from '@/admin/hooks/useProduct';
import { CustomFullScreenLoading } from '@/components/custom/CustomFullScreenLoading';
import { ProductForm } from './ui/ProductForm';
import type { Product } from '@/interface/product.interface';


export const AdminProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {isLoading, isError, data: product, mutation, deleteImageMutation} = useProduct(id || '');

  
  const title = id === 'new' ? 'Nuevo producto' : 'Editar producto';
  const subTitle =
    id === 'new'
      ? 'Aquí puedes crear un nuevo producto.'
      : 'Aquí puedes editar el producto.';


    const handleSubmit = async(productLike: Partial<Product> & {files?: File[]}) => {
      await mutation.mutateAsync(productLike,{
        onSuccess: (data) => {
          toast.success(`Producto ${id === 'new' ? 'creado' : 'actualizado'} con éxito`, {
            position: 'top-right',
            duration: 3000,
          });
          navigate(`/admin/products/${data.id}`);
        },
        onError: (error) => {
          console.error('Error al crear/actualizar el producto', error);
          toast.error('Error al crear/actualizar el producto', {
            position: 'top-right',
            duration: 3000,
          });
        }
      });
    };

    const handleDeleteImage = async(imageUrl: string) => {
      if (!product?.id) return;

      await deleteImageMutation.mutateAsync({
        productId: product.id,
        imageUrl,
        images: product.images,
      }, {
        onSuccess: () => {
          toast.success('Imagen eliminada con éxito', {
            position: 'top-right',
            duration: 3000,
          });
        },
        onError: (error) => {
          console.error('Error al eliminar la imagen', error);
          toast.error('Error al eliminar la imagen', {
            position: 'top-right',
            duration: 3000,
          });
        }
      });
    };

  if (isError) {
    return <Navigate to="/admin/products" />;
  }
  if (isLoading) {
    return <CustomFullScreenLoading />;
  }
  if (!product) {
    return <Navigate to="/admin/products" />;
  }

  return <ProductForm 
    title={title}
    subTitle={subTitle}
    product={product}
    onSubmit={handleSubmit}
    isPending={mutation.isPending}
    onDeleteImage={handleDeleteImage}
  />

};
