import { Navigate, useParams } from 'react-router';
import { useProduct } from '@/admin/hooks/useProduct';
import { CustomFullScreenLoading } from '@/components/custom/CustomFullScreenLoading';
import { ProductForm } from './ui/productForm';

interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  slug: string;
  stock: number;
  tags: string[];
  images: string[];
}

export const AdminProductPage = () => {
  const { id } = useParams();

  const {isLoading, isError, data: product} = useProduct(id || '');

  
  const title = id === 'new' ? 'Nuevo producto' : 'Editar producto';
  const subTitle =
    id === 'new'
      ? 'Aquí puedes crear un nuevo producto.'
      : 'Aquí puedes editar el producto.';

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
  />

};
