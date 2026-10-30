import client from './client.ts';

export type ProductImageUploadResult = {
  url: string;
  publicId: string;
  fileName: string;
};

export const uploadApi = {
  productImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return client.post<ProductImageUploadResult>('/upload/product-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60_000,
    });
  },
};
