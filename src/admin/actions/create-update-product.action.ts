import { butcherApi } from "@/api/butcherApi";
import type { Product } from "@/interface/product.interface";
import {
    normalizeProductImageForSave,
    resolveProductImageUrl,
} from "@/lib/product-image";
import { sleep } from "@/lib/sleep";

export const createUpdateProductAction = async (
    productLike: Partial<Product> & { files?: File[] }
): Promise<Product> => {
    await sleep(300);

    const {id, images= [], files = [], ...rest} = productLike;
    delete (rest as { user?: unknown }).user;

    const isCreating = id === 'new';

    rest.stock = Number(rest.stock || 0);
    rest.price = Number(rest.price || 0);
    rest.maxKgPerOrder = Number(rest.maxKgPerOrder || 10);
    rest.isActive = rest.isActive === undefined ? true : Boolean(rest.isActive);
    rest.allowBoxes = rest.allowBoxes === undefined ? false : Boolean(rest.allowBoxes);


    // Preparar las imagenes
    if (files.length > 0) {
        const newImageNames = await uploadFiles(files);
        images.push(...newImageNames);
    }

    const imagesToSave = images
        .map(normalizeProductImageForSave)
        .filter(Boolean);


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
        images: data.images.map(resolveProductImageUrl)
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