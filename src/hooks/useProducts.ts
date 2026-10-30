import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, productsApi, type ProductWrite } from '../api/products.ts';
import { uploadApi } from '../api/upload.ts';
import { adminQueryKeys } from '../lib/queryKeys.ts';
import type { ListParams, ProductStatus } from '../types/api.ts';

export const useProducts = (params: ListParams = {}) =>
  useQuery({
    queryKey: adminQueryKeys.products(params),
    queryFn: async () => (await productsApi.list(params)).data,
    placeholderData: keepPreviousData,
  });

export const useProduct = (id: string | undefined) =>
  useQuery({
    queryKey: adminQueryKeys.product(id),
    queryFn: async () => (await productsApi.get(id as string)).data.item,
    enabled: Boolean(id),
  });

const invalidateCatalog = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: adminQueryKeys.productsRoot });
  void queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ProductWrite) => productsApi.create(body),
    onSuccess: () => invalidateCatalog(queryClient),
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<ProductWrite> }) => productsApi.update(id, body),
    onSuccess: () => invalidateCatalog(queryClient),
  });
};

export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProductStatus }) => productsApi.updateStatus(id, status),
    onSuccess: () => invalidateCatalog(queryClient),
  });
};

export const useUploadProductImage = () =>
  useMutation({
    mutationFn: (file: File) => uploadApi.productImage(file),
  });

export const useDuplicateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.duplicate(id),
    onSuccess: () => invalidateCatalog(queryClient),
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => invalidateCatalog(queryClient),
  });
};

export const useExportProducts = () =>
  useMutation({
    mutationFn: async (params: ListParams) => (await productsApi.exportCsv(params)).data,
  });

export const useCategories = () =>
  useQuery({
    queryKey: adminQueryKeys.categories,
    queryFn: async () => (await categoriesApi.list()).data.categories,
  });

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; code?: string; slug?: string; isActive?: boolean }) =>
      categoriesApi.create(body),
    onSuccess: () => invalidateCatalog(queryClient),
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Partial<{ name: string; code: string; slug: string; isActive: boolean }>;
    }) => categoriesApi.update(id, body),
    onSuccess: () => invalidateCatalog(queryClient),
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: () => invalidateCatalog(queryClient),
  });
};
