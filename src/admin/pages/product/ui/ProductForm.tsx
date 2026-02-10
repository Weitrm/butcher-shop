import { Link } from "react-router";
import { useEffect, useState } from "react";
import { AdminTitle } from "@/admin/components/AdminTitle";

import { useForm } from "react-hook-form";

import type { Product } from "@/interface/product.interface";

import { Button } from "@/components/ui/button";
import { SaveAll, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";


interface Props {
    title: string;
    subTitle: string;
    product: Product;
    isPending: boolean;

    //Methods
    onSubmit: (productLike: Partial<Product> & { files?: File[] }) => Promise<void>;
    onDeleteImage: (imageUrl: string, images: string[]) => Promise<void>;
}

interface FormInputs extends Product {
    files?: File[];

}

export const ProductForm = ({title, subTitle, product, onSubmit, isPending, onDeleteImage}: Props) => {

    const [dragActive, setDragActive] = useState(false);
    // useForm hook
    const {register, handleSubmit, formState: {errors}, watch, getValues, setValue} = useForm<FormInputs>({
        defaultValues: product
    })

    const [files, setFiles] = useState<File[]>([]);
    const [images, setImages] = useState<string[]>(product.images || []);

    useEffect(() => {
        setFiles([]);
        setImages(product.images || []);
        setValue('images', product.images || []);
    }, [product])

    const currentStock = watch('stock');
    const isActive = watch('isActive') ?? true;


  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (!files) return;

    setFiles((prev) => [...prev, ...Array.from(files)]);
    const currentFiles = getValues('files') || [];
    setValue('files', [...currentFiles, ...Array.from(files)]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setFiles((prev) => [...prev, ...Array.from(files)]);
    const currentFiles = getValues('files') || [];
    setValue('files', [...currentFiles, ...Array.from(files)]);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex justify-between items-center">
            <AdminTitle title={title} subtitle={subTitle} />
            <div className="flex justify-end mb-10 gap-4">
            <Button variant="outline" type="button">
                <Link to="/admin/products" className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Cancelar
                </Link>
            </Button>

            <Button type="submit" disabled={isPending}>
                <SaveAll className="w-4 h-4" />
                Guardar
            </Button>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-6">
                    Información del producto
                </h2>

                <div className="space-y-6">
                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Título del producto
                    </label>
                    <input
                        type="text"
                        {...register('title', {required: true})}
                        className={cn("w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200", { "border-red-500": errors.title })}
                        placeholder="Título del producto"
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">El título es requerido</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                        Precio ($)
                        </label>
                        <input
                        type="number"
                        {...register('price', {required: true, min: 1})}
                        className={cn("w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200", { "border-red-500": errors.price })}
                        placeholder="Precio del producto"
                        />
                        {errors.price && <p className="text-red-500 text-sm mt-1">El precio es requerido y debe ser mayor a 1</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                        Stock del producto (KG)
                        </label>
                        <input
                        type="number"
                        {...register('stock', {required: true})}
                        className={cn("w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200", { "border-red-500": errors.stock })}
                        placeholder="Stock del producto"
                        />
                        {errors.stock && <p className="text-red-500 text-sm mt-1">El stock es requerido</p>}
                    </div>
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Slug del producto
                    </label>
                    <input
                        type="text"
                        {...register('slug', {required: true, validate: (value) => !/\s/.test(value) || 'El slug no puede contener espacios' })}
                        className={cn("w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200", { "border-red-500": errors.slug })}
                        placeholder="Slug del producto"
                    />
                    {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message || 'El slug es requerido'}</p>}
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Descripción del producto
                    </label>
                    <textarea
                        {...register('description', {required: true})}
                        rows={5}
                        className={cn("w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none", { "border-red-500": errors.description })}
                        placeholder="Descripción del producto"
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">La descripción es requerida</p>}
                    </div>
                </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                {/* Product Images */}
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-6">
                    Imágenes del producto
                </h2>

                {/* Drag & Drop Zone */}
                <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                    dragActive
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    />
                    <div className="space-y-4">
                    <Upload className="mx-auto h-12 w-12 text-slate-400" />
                    <div>
                        <p className="text-lg font-medium text-slate-700">
                        Arrastra las imágenes aquí
                        </p>
                        <p className="text-sm text-slate-500">
                        o haz clic para buscar
                        </p>
                    </div>
                    <p className="text-xs text-slate-400">
                        PNG, JPG, WebP hasta 10MB cada una
                    </p>
                    </div>
                </div>

                {/* Current Images */}
                <div className="mt-6 space-y-3">
                    <h3 className="text-sm font-medium text-slate-700">
                    Imágenes actuales
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                    {images.map((image, index) => (
                        <div key={index} className="relative group">
                        <div className="aspect-square bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center">
                            <img
                            src={image}
                            alt="Product"
                            className="w-full h-full object-cover rounded-lg"
                            />
                        </div>
                        <button
                        type="button"
                        onClick={() => {
                            if (images.length <= 1) return;
                            const nextImages = images.filter((img) => img !== image);
                            setImages(nextImages);
                            setValue('images', nextImages);
                            onDeleteImage(image, nextImages);
                        }}
                        disabled={images.length <= 1}
                        className={cn(
                            "absolute top-2 right-2 p-1 rounded-full transition-opacity duration-200",
                            images.length <= 1
                                ? "bg-slate-300 text-slate-500 cursor-not-allowed opacity-100"
                                : "bg-red-500 text-white opacity-0 group-hover:opacity-100"
                        )}
                        >
                            <X className="h-3 w-3" />
                        </button>
                        <p className="mt-1 text-xs text-slate-600 truncate">
                            {image}
                        </p>
                        </div>
                    ))}
                    </div>
                </div>

                {/* imagenes por cargar */}
                
                <div className={
                    cn("mt-6 space-y-3", {'hidden': files.length === 0})
                }>
                    <h3 className="text-sm font-medium text-slate-700">
                    Imágenes por cargar
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {files.map((file, index) => (
                            <img
                            src={URL.createObjectURL(file)}
                            alt="Product"
                            key={index}
                            className="w-full h-full object-cover rounded-lg"
                            />
                        ))}
                    </div>
                </div>
                </div>

                {/* Product Status */}
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-6">
                    Estado del producto
                </h2>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">
                        Estado
                    </span>
                    <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    )}>
                        {isActive ? 'Activo' : 'Inactivo'}
                    </span>
                    </div>

                    <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-700">
                            Habilitado para venta
                        </span>
                        <input
                            type="checkbox"
                            {...register('isActive')}
                            className="h-4 w-4"
                        />
                    </label>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">
                        Inventario
                    </span>
                    <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                        currentStock > 199
                            ? 'bg-green-100 text-green-800'
                            : currentStock > 100
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {currentStock > 199
                        ? 'En stock'
                        : currentStock > 100
                        ? 'Bajo stock'
                        : 'Sin stock'}
                    </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">
                        Imágenes
                    </span>
                    <span className="text-sm text-slate-600">
                        {images.length} imágenes
                    </span>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
        </form>
  );
}

