import { butcherApi } from "@/api/butcherApi";
import type { Product } from "@/interface/product.interface";
import { sleep } from "@/lib/sleep";


export const createUpdateProductAction = async (
    productLike: Partial<Product> & { files?: File[] }
): Promise<Product> => {

    await sleep(1000);

    const {id, user, images= [], files = [], ...rest} = productLike;

    const isCreating = id === 'new';

    rest.stock = Number(rest.stock || 0);
    rest.price = Number(rest.price || 0);
    rest.isActive = rest.isActive === undefined ? true : Boolean(rest.isActive);


    // Preparar las imagenes
    if (files.length > 0) {
        const newImageNames = await uploadFiles(files);
        images.push(...newImageNames);
    }

    const imagesToSave = images.map(image => {
        if(image.includes('http')) return image.split('/').pop() || '';
        return image;
    })


    const {data} = await butcherApi<Product>({
        url: isCreating ? '/products' : `/products/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: {
            ...rest,
            images: imagesToSave,
        }
    })

    return {
        ...data,
        images: data.images.map(image => {
            if (images.includes('http')) return image;
            return `${import.meta.env.VITE_API_URL}/files/product/${image}`;
        })
    }
};

export interface FileUploadResponse {
    secureUrl: string;
    fileName: string;
}

const uploadFiles = async (files: File[]) => {

    const uploadPromises = files.map(async file => {
        const formData = new FormData();
        formData.append('file', file);

        const {data} = await butcherApi<FileUploadResponse>({
                url: '/files/product',
                method: 'POST',
                data: formData
            })

        return data.fileName;
    }) 

 const uploadedFileNames = await Promise.all(uploadPromises);

 return uploadedFileNames;
}
